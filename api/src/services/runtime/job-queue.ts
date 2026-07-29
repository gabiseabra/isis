import { UUID } from "@isis/common/dto/uuid";
import { never } from "@isis/common/utils/error";
import * as Bull from "bullmq";
import { RedisClient } from "../redis/client";

/**
 * Typed background-work job queue for one application resource.
 *
 * A `JobQueue` is a producer when constructed: it can enqueue named jobs and
 * return handles for observing their status without doing the work in this
 * process.
 *
 * Call `startWorker()` when this process should also consume jobs from the same
 * queue. The worker routes each queued job to the handler with the matching
 * name from the worker map.
 *
 * Use this for durable work that should run outside the caller's request flow.
 * In normal operation a queued job is claimed by one worker at a time, but job
 * handlers should still be retry-safe because failed or stalled work may be
 * attempted again.
 */
export class JobQueue<T extends AnyJobMap> implements AsyncDisposable {
  private bullQueue: Bull.Queue<
    JobInputs<T>,
    JobReturns<T>,
    keyof T & string,
    JobInputs<T>,
    JobReturns<T>,
    keyof T & string
  >;
  private bullWorker?: Bull.Worker<
    JobInputs<T>,
    JobReturns<T>,
    keyof T & string
  >;
  private bullQueueEvents: Bull.QueueEvents;
  private closePromise?: Promise<void>;

  constructor(
    private resourceName: string,
    private workers: T,
  ) {
    const connection = RedisClient.duplicate();
    const queue = new Bull.Queue<
      JobInputs<T>,
      JobReturns<T>,
      keyof T & string,
      JobInputs<T>,
      JobReturns<T>,
      keyof T & string
    >(this.resourceName, { connection });

    this.bullQueue = queue;
    this.bullQueueEvents = new Bull.QueueEvents(this.resourceName, {
      connection,
    });
  }

  async startWorker() {
    if (this.bullWorker) return;

    const connection = RedisClient.duplicate();

    const worker = new Bull.Worker<
      JobInputs<T>,
      JobReturns<T>,
      keyof T & string
    >(
      this.resourceName,
      async (job) => {
        return this.workers[job.name](...job.data);
      },
      { connection },
    );

    this.bullWorker = worker;
  }

  async close() {
    this.closePromise ??= (async () => {
      await this.bullWorker?.waitUntilReady();
      await this.bullWorker?.close();
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
    const jobId = UUID.create();
    await this.bullQueue.add(type, args, { jobId });
    const job = await this.getJob(jobId);
    if (job.type !== type) never("?");
    return job as Job<T, K>;
  }

  async getJob(id: UUID): Promise<Job<T>> {
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
