import { JobQueue } from "./job-queue";
import { shutDown } from "./shut-down";

class TestQueue extends JobQueue<{
  add(left: number, right: number): Promise<number>;
}> {
  constructor() {
    super("TestQueue", {
      async add(left, right) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return left + right;
      },
    });
  }
}

let testQueue: TestQueue;

beforeEach(async () => {
  testQueue = new TestQueue();
});

afterAll(async () => {
  shutDown();
});

describe("JobQueue", () => {
  describe("push", () => {
    it("creates a pending job", async () => {
      const job = await testQueue.push("add", 1, 2);

      expect(job.type).toBe("add");
      expect(job.getStatus()).resolves.toMatchObject({ status: "pending" });
    });
  });

  describe("getJob", () => {
    it("returns a job by id", async () => {
      const { id } = await testQueue.push("add", 1, 2);
      const job = await testQueue.getJob(id);

      expect(job.id).toBe(id);
      expect(job.type).toBe("add");
    });
  });

  describe("Job", () => {
    describe("waitUntilFinished", () => {
      it("waits until the job is finished processing and returns the result", async () => {
        const job = await testQueue.push("add", 1, 2);

        const result = await job.waitUntilFinished();

        expect(result).toMatchObject({
          status: "done",
          success: true,
          data: 3,
        });
      });
    });
  });
});
