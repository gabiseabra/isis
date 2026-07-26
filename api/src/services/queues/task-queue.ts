import { UUID } from "@isis/common/dto/uuid";
import { never } from "@isis/common/utils/error";
import * as Bull from "bullmq";
import { RedisClient } from "../../redis/client";

type AnyTaskMap = { [k: string]: (...args: any[]) => any };
type TaskInputs<T extends AnyTaskMap, K extends keyof T = keyof T> = {
  [k in keyof T]: Parameters<T[k]>;
}[K];
type TaskReturns<T extends AnyTaskMap> = {
  [K in keyof T]: Awaited<ReturnType<T[K]>>;
}[keyof T];

export type Job<T extends AnyTaskMap, K extends keyof T = keyof T> = {
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

export class TaskQueue<T extends AnyTaskMap> {
  closed = false;

  private bullQueue: Bull.Queue<
    TaskInputs<T>,
    TaskReturns<T>,
    keyof T & string,
    TaskInputs<T>,
    TaskReturns<T>,
    keyof T & string
  >;
  private bullWorker: Bull.Worker<
    TaskInputs<T>,
    TaskReturns<T>,
    keyof T & string
  >;
  private bullQueueEvents: Bull.QueueEvents;

  constructor(
    private resourceName: string,
    private taskMap: T,
  ) {
    const queue = new Bull.Queue<
      TaskInputs<T>,
      TaskReturns<T>,
      keyof T & string,
      TaskInputs<T>,
      TaskReturns<T>,
      keyof T & string
    >(this.resourceName, { connection: RedisClient.io });

    const worker = new Bull.Worker<
      TaskInputs<T>,
      TaskReturns<T>,
      keyof T & string
    >(
      this.resourceName,
      async (job) => {
        return this.taskMap[job.name](...job.data);
      },
      { connection: RedisClient.io },
    );

    this.bullQueue = queue;
    this.bullWorker = worker;
    this.bullQueueEvents = new Bull.QueueEvents(this.resourceName, {
      connection: RedisClient.io,
    });

    RedisClient.registerResource(this);
  }

  async close() {
    await this.bullWorker?.close();
    await this.bullQueue?.close();
    await this.bullQueueEvents?.close();
    this.closed = true;
  }

  async push<K extends keyof T & string>(
    task: K,
    ...args: TaskInputs<T, K>
  ): Promise<Job<T, K>> {
    if (this.closed) never("connection is closed");

    const jobId = UUID.create();
    await this.bullQueue.add(task, args, { jobId });
    return this.getJob(jobId, task);
  }

  async getJob<K extends keyof T & string>(
    id: UUID,
    type: K,
  ): Promise<Job<T, K>> {
    if (this.closed) never("connection is closed");

    const job = (await this.bullQueue.getJob(id)) ?? never("eyy");
    if (job.name !== type) never("?");
    return {
      id,
      type,
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
