import { UUID } from "@isis/common/dto/uuid";
import { never } from "@isis/common/utils/error";
import * as Bull from "bullmq";
import { RedisClient } from "../../redis/client";

const bullConnection = RedisClient.duplicate(Math.random(), {
  maxRetriesPerRequest: null,
});

export class JobQueue<T extends AnyJobMap> implements AsyncDisposable {
  closed = false;

  private bullQueue: Bull.Queue<
    JobInputs<T>,
    JobReturns<T>,
    keyof T & string,
    JobInputs<T>,
    JobReturns<T>,
    keyof T & string
  >;
  private bullWorker: Bull.Worker<
    JobInputs<T>,
    JobReturns<T>,
    keyof T & string
  >;
  private bullQueueEvents: Bull.QueueEvents;
  private readonly bullWorkerReady: Promise<unknown>;
  private closePromise?: Promise<void>;

  constructor(
    private resourceName: string,
    private taskMap: T,
  ) {
    const queue = new Bull.Queue<
      JobInputs<T>,
      JobReturns<T>,
      keyof T & string,
      JobInputs<T>,
      JobReturns<T>,
      keyof T & string
    >(this.resourceName, { connection: bullConnection });

    const worker = new Bull.Worker<
      JobInputs<T>,
      JobReturns<T>,
      keyof T & string
    >(
      this.resourceName,
      async (job) => {
        return this.taskMap[job.name](...job.data);
      },
      { connection: bullConnection },
    );

    this.bullQueue = queue;
    this.bullWorker = worker;
    this.bullWorkerReady = worker.waitUntilReady().catch(() => undefined);
    this.bullQueueEvents = new Bull.QueueEvents(this.resourceName, {
      connection: bullConnection,
    });
  }

  async close() {
    if (this.closePromise) return this.closePromise;
    this.closed = true;
    this.closePromise = (async () => {
      await this.bullWorkerReady;
      await this.bullWorker.close();
      await this.bullQueueEvents.close();
      await this.bullQueue.close();
    })();
    return this.closePromise;
  }

  async [Symbol.asyncDispose]() {
    await this.close();
  }

  async push<K extends keyof T & string>(
    type: K,
    ...args: JobInputs<T, K>
  ): Promise<Job<T, K>> {
    if (this.closed) never("connection is closed");

    const jobId = UUID.create();
    await this.bullQueue.add(type, args, { jobId });
    const job = await this.getJob(jobId);
    if (job.type !== type) never("?");
    return job as Job<T, K>;
  }

  async getJob(id: UUID): Promise<Job<T>> {
    if (this.closed) never("connection is closed");

    const job = (await this.bullQueue.getJob(id)) ?? never("eyy");
    return {
      id,
      type: job.name,
      getStatus: async () => {
        const state = await job.getState();

        if (state === "completed") {
          return { status: "done", success: true, data: job.returnvalue };
        }

        if (state === "failed") {
          return { status: "done", success: false, error: job.failedReason };
        }

        return { status: "pending" };
      },
      waitUntilFinished: async (ttl?: number) => {
        return {
          status: "done",
          success: true,
          data: await job.waitUntilFinished(this.bullQueueEvents, ttl),
        };
      },
    };
  }
}

export type Job<T extends AnyJobMap, K extends keyof T = keyof T> = {
  id: UUID;
  type: K;
  getStatus(): Promise<JobStatus<T>>;
  waitUntilFinished(ttl?: number): Promise<ReadyJobResult<T[K]>>;
};

export type JobStatus<T> = ReadyJobResult<T> | { status: "pending" };
export type ReadyJobResult<T> =
  | {
      status: "done";
      success: true;
      data: T;
    }
  | {
      status: "done";
      success: false;
      error: unknown;
    };

type AnyJobMap = { [k: string]: (...args: any[]) => any };

type JobInputs<T extends AnyJobMap, K extends keyof T = keyof T> = {
  [k in keyof T]: Parameters<T[k]>;
}[K];

type JobReturns<T extends AnyJobMap> = {
  [K in keyof T]: Awaited<ReturnType<T[K]>>;
}[keyof T];
