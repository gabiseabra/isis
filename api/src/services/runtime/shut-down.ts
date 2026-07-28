import Emittery from "emittery";

const AppLifecycleBus = new Emittery<{
  shutDown: undefined;
}>();

/**
 * Runs registered application shutdown hooks in registration order.
 *
 * @note call this from integration tests after test-specific teardown so shared
 *       runtime resources (database pools, Redis connections, queues, etc.) get
 *       disposed properly.
 */
export async function shutDown() {
  await AppLifecycleBus.emitSerial("shutDown");
}

/**
 * Registers a callback to be run when {@link shutDown} is called.
 *
 * @returns an unsubscribe function for resources whose lifecycle ends before
 *          the application or integration test process shuts down.
 */
export function onShutDown(listener: () => void | Promise<void>): () => void {
  return AppLifecycleBus.on("shutDown", listener);
}
