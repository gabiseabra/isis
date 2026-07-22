import { useMutation } from "@tanstack/react-query";
import { orpcQuery, queryClient } from "../client";

export function useUploadMediaMutation(
  options?: Parameters<typeof orpcQuery.media.upload.mutationOptions>[0],
) {
  return useMutation(
    orpcQuery.media.upload.mutationOptions({
      ...options,
      onSuccess(entry, ...args) {
        queryClient.refetchQueries({
          queryKey: orpcQuery.media.queryChildren.key(),
        });

        options?.onSuccess?.(entry, ...args);
      },
    }),
  );
}
