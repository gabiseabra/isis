import IORedis from "ioredis";
import { onShutDown } from "../services/runtime/shut-down";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

let connection = createRedisClient(REDIS_URL);
const resources = new Set<{ close: () => Promise<void> | void }>();

export const RedisClient = {
  get io() {
    return connection;
  },

  async setUrl(url: string) {
    await this.close();
    connection = createRedisClient(url);
  },

  async close() {
    for (const resource of [...resources].reverse()) {
      await resource.close();
      resources.delete(resource);
    }

    await connection.quit();
  },

  registerResource(resource: { close: () => Promise<void> | void }): void {
    resources.add(resource);
  },
};

function createRedisClient(url: string) {
  const redis = new IORedis(url, {
    maxRetriesPerRequest: null,
  });

  redis.on("error", (error) => {
    console.error("Redis connection error", error);
  });

  return redis;
}

onShutDown(() => RedisClient.close());
