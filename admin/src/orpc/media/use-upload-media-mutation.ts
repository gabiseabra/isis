import { Media } from "@isis/common/dto/media";
import { MediaInput } from "@isis/common/dto/media/input";
import { s3Upload } from "@isis/ui/utils/s3-upload";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useState } from "react";
import { orpcClient, orpcQuery, queryClient } from "../client";

export function useUploadMediaMutation(
  options?: Omit<
    UseMutationOptions<
      Media,
      Error,
      MediaInput & {
        file: File;
        signal?: AbortSignal;
      }
    >,
    "mutationFn"
  >,
) {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    ...options,
    async mutationFn({ signal, file, ...input }) {
      setProgress(0);

      const { key, url } = await orpcClient.media.createUploadUrl({
        name: file.name,
        type: file.type,
      });

      await s3Upload(url, file, {
        signal,
        onProgress: (progress) => setProgress(progress.percent / 100),
      });

      return orpcClient.media.upsert({
        ...input,
        metadata: {
          ...input.metadata,
          type: "file",
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storageKey: key,
        },
      });
    },

    onSuccess(entry, ...args) {
      queryClient.refetchQueries({
        queryKey: orpcQuery.media.queryChildren.key(),
      });

      options?.onSuccess?.(entry, ...args);
    },
  });

  return {
    ...mutation,
    progress,
  };
}
