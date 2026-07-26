import { UUID } from "@isis/common/dto/uuid";
import {
  clearRedisTest,
  setupRedisTest,
  tearDownRedisTest,
} from "../../test/setup-redis";
import { TaskQueue } from "./task-queue";

const redisID = UUID.create();

beforeAll(async () => {
  await setupRedisTest(redisID);
});

afterAll(async () => {
  await tearDownRedisTest(redisID);
});

beforeEach(async () => {
  await clearRedisTest(redisID);
});

describe("TaskQueue", () => {
  it("processes a dispatched task", async () => {
    const taskMap = {
      add: jest.fn((left: number, right: number) => {
        const sum = left + right;
        return sum;
      }),
    } as const;
    const testQueue = new TaskQueue("TestQueue", taskMap);

    const job = await testQueue.push("add", 1, 2);

    const result = await job.waitUntilFinished();

    expect(result).toMatchObject({
      status: "done",
      success: true,
      data: 3,
    });
  });
});
