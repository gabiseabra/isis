import { IORedisPublisher } from "@orpc/experimental-publisher/ioredis";
import { RedisClient } from "../redis/client";

const commander = RedisClient.duplicate(Math.random(), {
  maxRetriesPerRequest: 123,
});
const listener = RedisClient.duplicate(Math.random(), {
  maxRetriesPerRequest: 123,
});

export class Publisher<
  T extends Record<string, object>,
> extends IORedisPublisher<T> {
  constructor(public name: string) {
    super({
      commander,
      listener,
      prefix: `isis:${name}:publisher:`,
    });
  }
}
