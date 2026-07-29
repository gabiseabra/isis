import { IORedisPublisher } from "@orpc/experimental-publisher/ioredis";
import { RedisClient } from "../redis/client";

const commander = RedisClient.duplicate();
const listener = RedisClient.duplicate();

/**
 * Typed live-event channel for one application resource.
 *
 * A `Publisher` is for immediate fan-out notifications: code can publish named
 * events, and listeners that are currently subscribed to that event can react
 * as those events happen.
 *
 * Use this for live reactions such as refreshing clients, invalidating local
 * state, or notifying other parts of the app that a domain change occurred.
 */
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
