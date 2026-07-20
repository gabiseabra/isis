import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { IconButton } from "@isis/ui/display/IconButton";
import { Span, Text } from "@isis/ui/display/Text";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { useToast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Col, FlexBox, FlexBoxProps, Row } from "@isis/ui/layout/FlexBox";
import { Nav } from "@isis/ui/layout/Nav";
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { BiFolderPlus, BiPlus, BiUpload } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";

type MediaControlsProps = Omit<FlexBoxProps, "children"> & {
  path?: Path;
  onCreateMedia?: (media: Media) => void;
};

export function MediaControls({
  path,
  onCreateMedia,
  ...props
}: MediaControlsProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [newFolderName, setNewFolderName] = useState("");

  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({
      input: path ? { path } : skipToken,
    }),
  );
  const upsertMediaMutation = useMutation(
    orpcQuery.media.upsert.mutationOptions({
      onSuccess(media) {
        toast.show({
          type: "success",
          message: "Pasta criada.",
        });

        queryClient.refetchQueries({
          queryKey: orpcQuery.media.queryChildren.key(),
        });

        onCreateMedia?.(media);
      },
      onError(error) {
        toast.show({
          type: "error",
          message: extractErrorMessage(error),
        });
      },
    }),
  );

  function createNewFolder() {
    upsertMediaMutation.mutate({
      parentId: entryQuery.data?.id,
      name: newFolderName,
      tags: [],
      metadata: {
        type: "folder",
      },
    });
  }

  return (
    <FlexBox gap={1} {...props}>
      <Nav.Item
        title="lmao"
        render={() => (
          <Input
            left={
              upsertMediaMutation.isPending ? (
                <Spinner size="s" color="muted" />
              ) : (
                <BiFolderPlus />
              )
            }
            right={
              <IconButton
                variant="sheer"
                onClick={createNewFolder}
                disabled={!newFolderName || upsertMediaMutation.isPending}
              >
                <BiPlus />
              </IconButton>
            }
            variant="unstyled"
            value={newFolderName}
            onChangeValue={setNewFolderName}
            placeholder="Criar pasta"
          />
        )}
      />
    </FlexBox>
  );
}
