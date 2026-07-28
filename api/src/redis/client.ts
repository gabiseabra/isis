import { never } from "@isis/common/utils/error";
import IORedis, { RedisOptions } from "ioredis";
import { onShutDown } from "../services/runtime/shut-down";

let globalConnection: IORedis;
const connections = new Map<number, IORedis>();

export const RedisClient = {
  get URL() {
    return process.env.REDIS_URL ?? never("REDIS_URL not configured");
  },

  get io() {
    const connection = globalConnection ?? createRedisClient(RedisClient.URL);
    globalConnection = connection;
    return connection;
  },

  duplicate(instance: number, options?: Partial<RedisOptions>) {
    const io = connections.get(instance) ?? RedisClient.io.duplicate(options);
    connections.set(instance, io);
    return io;
  },

  async close(instance?: number) {
    if (instance) {
      const io = connections.get(instance);
      if (io) await closeRedisConnection(io);
      connections.delete(instance);
      return;
    }

    for (const io of connections.values()) {
      await closeRedisConnection(io);
    }
    await closeRedisConnection(globalConnection);
    connections.clear();
  },
};

export async function closeRedisConnection(redis: IORedis): Promise<void> {
  redis.removeAllListeners();
  if (redis.status !== "end") {
    await new Promise<void>((resolve) => {
      redis.once("end", resolve);
      redis.disconnect(false);
    });
  }
}

function createRedisClient(url: string): IORedis {
  const redis = new IORedis(url, {
    maxRetriesPerRequest: null,
  });
  redis.on("error", (error) => {
    console.error("Redis connection error", error);
  });

  return redis;
}

onShutDown(() => RedisClient.close());
