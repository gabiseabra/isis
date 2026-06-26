import { User } from "@isis/common/dto/user";
import { ORPCError } from "@orpc/client";
import { redirect, useLoaderData } from "react-router";
import { orpcClient, orpcQuery, queryClient } from "../orpc/client";

export async function authLoader() {
  const user =
    queryClient.getQueryData(orpcQuery.users.me.queryKey({})) ??
    (await orpcClient.users.me().catch((error) => {
      if (error instanceof ORPCError && error.status === 401) return null;
      throw error;
    }));

  if (!user) return redirect("/login");

  return { user };
}

authLoader.hydrate = true;

export function useAuthLoader() {
  return useLoaderData<{ user: User }>();
}
