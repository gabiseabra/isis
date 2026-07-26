import crypto from "node:crypto";
import { RedisClient } from "../redis/client";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const testRedisDatabases = 15;

export async function setupRedisTest(id: string) {
  const url = new URL(redisUrl);
  url.pathname = `/${getRedisDatabase(id)}`;
  await RedisClient.setUrl(url.toString());
  await clearRedisTest(id);
}

export async function tearDownRedisTest(id: string) {
  await clearRedisTest(id);
  await RedisClient.close();
}

export async function clearRedisTest(_id: string) {
  await RedisClient.io.flushdb();
}

function getRedisDatabase(id: string) {
  const hash = crypto.createHash("sha256").update(id).digest();
  return (hash.readUInt32BE(0) % testRedisDatabases) + 1;
}
