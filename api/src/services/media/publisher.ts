import { Media } from "@isis/common/dto/media";
import { Publisher } from "../runtime/publisher";

export const MediaPublisher = new Publisher<{
  created: Media;
  updated: Media;
  deleted: Media & {
    deletedAt: Date;
  };
}>("Media");

export function publishMedia(before: Media | null, after: Media) {
  if (!before) {
    return MediaPublisher.publish("created", after);
  }

  const deletedAt = after.deletedAt;
  if (!before.deletedAt && deletedAt) {
    return MediaPublisher.publish("deleted", {
      ...after,
      deletedAt,
    });
  }

  return MediaPublisher.publish("updated", after);
}
