import { Media } from "@isis/common/dto/media";
import { IORedisPublisher } from "@orpc/experimental-publisher/ioredis";
import { RedisClient } from "../../redis/client";

export const MediaPublisher = new IORedisPublisher<{
  created: Media;
  updated: Media;
  deleted: Media & {
    deletedAt: Date;
  };
}>({
  commander: RedisClient.io,
  listener: RedisClient.io.duplicate(),
  prefix: "isis:media:jobs:",
});

export function publishMedia(before: Media | null, after: Media) {
  if (!before) {
    return MediaPublisher.publish("created", after);
  } else if (before && !before.deletedAt && after.deletedAt) {
    return MediaPublisher.publish("deleted", {
      ...after,
      // why doesnt ts narrow this ? :/
      deletedAt: after.deletedAt!,
    });
  } else {
    return MediaPublisher.publish("updated", after);
  }
}

MediaPublisher.subscribe("created", (media) =>
  console.log("created", { media }),
);
MediaPublisher.subscribe("updated", console.log);
