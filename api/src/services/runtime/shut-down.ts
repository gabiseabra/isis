import Emittery from "emittery";

const AppLifecycleBus = new Emittery<{
  shutDown: undefined;
}>();

export async function shutDown() {
  await AppLifecycleBus.emitSerial("shutDown");
}

export function onShutDown(listener: () => void | Promise<void>): () => void {
  return AppLifecycleBus.on("shutDown", listener);
}
