import { adminApi } from "@isis/common/orpc/admin";
import { runGenerator } from "@isis/common/utils/generator";
import { createORPCClient, onError, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins";
import {
  ContractRouterClient,
  inferRPCMethodFromContractRouter,
} from "@orpc/contract";
import { createTanstackQueryUtils, RouterUtils } from "@orpc/tanstack-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export type ORPCRouter = ContractRouterClient<adminApi>;
export type ORPCUtils = RouterUtils<ORPCRouter>;

function isAuthError(error: unknown) {
  return (
    error instanceof ORPCError && (error.status === 401 || error.status === 403)
  );
}

function redirectToAuth(error: unknown) {
  if (isAuthError(error) && !window.location.pathname.startsWith("/login"))
    window.location.replace("/login");
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: redirectToAuth,
  }),
  mutationCache: new MutationCache({
    onError: redirectToAuth,
  }),
});

const JWT_KEY = "isis-admin-jwt";

export function getToken() {
  return localStorage.getItem(JWT_KEY);
}

export function setToken(token: string) {
  return localStorage.setItem(JWT_KEY, token);
}

export function clearToken() {
  return localStorage.removeItem(JWT_KEY);
}

export const orpcClient: ORPCRouter = createORPCClient(
  new RPCLink({
    url: import.meta.env.VITE_API_URL,
    method: inferRPCMethodFromContractRouter(adminApi),
    plugins: [new SimpleCsrfProtectionLinkPlugin()],
    headers() {
      const token = getToken();
      return new Headers(
        runGenerator<[string, string], void>(function* () {
          if (token) yield ["authorization", `Bearer ${token}`];
        }).values,
      );
    },
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  }),
);

export const orpcQuery = createTanstackQueryUtils(orpcClient);
