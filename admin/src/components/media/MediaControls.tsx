import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { IconButton } from "@isis/ui/display/IconButton";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { useToast } from "@isis/ui/feedback/Toast";
import { Input } from "@isis/ui/form/Input";
import { FlexBox, FlexBoxProps } from "@isis/ui/layout/FlexBox";
import { Nav } from "@isis/ui/layout/Nav";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiFolderPlus, BiPlus } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import { useUpsertMediaMutation } from "../../orpc/media/use-upsert-media-mutation";

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

  const [newFolderName, setNewFolderName] = useState("");

  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({
      input: path ? { path } : skipToken,
    }),
  );
  const upsertMediaMutation = useUpsertMediaMutation({
    onSuccess(media) {
      toast.show({
        type: "success",
        message: `Pasta criada: ${media.name}`,
      });

      setNewFolderName("");

      onCreateMedia?.(media);
    },
    onError(error) {
      toast.show({
        type: "error",
        message: extractErrorMessage(error),
      });
    },
  });

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
        title=""
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
            onKeyDown={(e) => {
              if (e.key === "Enter") createNewFolder();
            }}
            disabled={
              upsertMediaMutation.isPending ||
              (entryQuery.isEnabled &&
                (entryQuery.isPending || entryQuery.isError))
            }
            placeholder={[
              `Criar pasta`,
              entryQuery.data && `em ${entryQuery.data?.name}`,
            ]
              .filter(Boolean)
              .join(" ")}
          />
        )}
      />
    </FlexBox>
  );
}
