import { Context, onError, Router } from "@orpc/server";
import { RPCHandler as FetchRPCHandler } from "@orpc/server/fetch";
import { RPCHandler as NodeRPCHandler } from "@orpc/server/node";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRouter<T extends Context> = Router<any, T>;

export function nodeRPCHandler<T extends Context>(router: AnyRouter<T>) {
  return new NodeRPCHandler(router, {
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });
}

export function fetchRPCHandler<T extends Context>(router: AnyRouter<T>) {
  return new FetchRPCHandler(router, {
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });
}
