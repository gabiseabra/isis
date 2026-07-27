import { Media } from "@isis/common/dto/media";
import { IORedisPublisher } from "@orpc/experimental-publisher/ioredis";
import { RedisClient } from "../../redis/client";

export const MediaPublisher = new IORedisPublisher<{
  created: Media;
  updated: Media;
  deleted: Media;
}>({
  commander: RedisClient.io,
  listener: RedisClient.io.duplicate(),
  prefix: "isis:media:jobs:",
});
