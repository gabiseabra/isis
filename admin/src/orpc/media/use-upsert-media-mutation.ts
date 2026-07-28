import { useMutation } from "@tanstack/react-query";
import { orpcQuery, queryClient } from "../client";

export function useUpsertMediaMutation(
  options?: Parameters<typeof orpcQuery.media.upsert.mutationOptions>[0],
) {
  return useMutation(
    orpcQuery.media.upsert.mutationOptions({
      ...options,
      onSuccess(entry, ...args) {
        queryClient.refetchQueries({
          queryKey: orpcQuery.media.query.key(),
        });

        options?.onSuccess?.(entry, ...args);
      },
    }),
  );
}
