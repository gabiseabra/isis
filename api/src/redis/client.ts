import IORedis from "ioredis";
import { onShutDown } from "../services/runtime/shut-down";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const connections = new Set<IORedis>();
const resources = new Set<{ close: () => Promise<void> | void }>();
let connection = createRedisClient(REDIS_URL);

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

    for (const redis of [...connections].reverse()) {
      redis.removeAllListeners();
      if (redis.status !== "end") {
        await new Promise<void>((resolve) => {
          redis.once("end", resolve);
          redis.disconnect(false);
        });
      }
      connections.delete(redis);
    }
  },

  registerResource(resource: { close: () => Promise<void> | void }): void {
    resources.add(resource);
  },
};

function createRedisClient(url: string) {
  const redis = new IORedis(url, {
    maxRetriesPerRequest: null,
  });
  connections.add(redis);

  const duplicate = redis.duplicate.bind(redis);
  redis.duplicate = (override) => trackRedis(duplicate(override));

  redis.on("error", (error) => {
    console.error("Redis connection error", error);
  });

  return redis;
}

function trackRedis(redis: IORedis) {
  connections.add(redis);

  const duplicate = redis.duplicate.bind(redis);
  redis.duplicate = (override) => trackRedis(duplicate(override));

  return redis;
}

onShutDown(() => RedisClient.close());
