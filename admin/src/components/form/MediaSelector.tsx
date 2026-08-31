import { Media } from "@isis/common/dto/media";
import { QueryMediaInput } from "@isis/common/dto/media/query-input";
import { ID } from "@isis/common/utils/id";
import { omit } from "@isis/common/utils/object";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { BaseInputProps } from "@isis/ui/form/use-form";
import { Modal } from "@isis/ui/overlay/Modal";
import { useQueries } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { orpcQuery } from "../../orpc/client";
import { MediaChildren } from "../media/MediaChildren";

type MediaSelectorProps = {
  open?: boolean;
  onClose?: () => void;
  label: ReactNode;
  description?: ReactNode;
  filters?: Omit<
    QueryMediaInput,
    "limit" | "page" | "offset" | "order" | "sort"
  >;
  isDisabled?: (media: Media) => boolean;
} & (
  | ({ multiple: true } & BaseInputProps<ID<"Media">[]>)
  | ({ multiple?: false } & BaseInputProps<ID<"Media">>)
);

export function MediaSelector({
  open: controlledOpen,
  onClose,
  filters,
  isDisabled,
  ...props
}: MediaSelectorProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;

  const mediaIds = props.multiple
    ? (props.value ?? [])
    : props.value
      ? [props.value]
      : [];
  const mediaQueries = useQueries({
    queries: mediaIds.map((id) =>
      orpcQuery.media.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(mediaIds.map((id, ix) => [id, queries[ix]])),
  });

  const isLoading = Object.values(mediaQueries).some((q) => q.isLoading);

  return (
    <>
      <Input
        onFocus={() => setLocalOpen(true)}
        {...omit(props, ["value", "onChangeValue"])}
        value={
          isLoading
            ? "Carregando..."
            : mediaIds.length > 1
              ? `${mediaIds.length} arquivos selecionados`
              : Object.values(mediaQueries)
                  .map((q) => q.data?.name ?? "Unknown media")
                  .join(", ")
        }
      />

      <Modal
        title={props.label}
        open={open}
        onClose={() => {
          onClose?.();
          setLocalOpen(false);
        }}
        footer={
          <Button
            onClick={() => {
              onClose?.();
              setLocalOpen(false);
            }}
          >
            Aplicar
          </Button>
        }
      >
        <MediaChildren
          filters={filters}
          onClickMedia={(media) => {
            if (props.multiple)
              props.onChangeValue?.(
                mediaIds.includes(media.id)
                  ? mediaIds.filter((id) => id !== media.id)
                  : [...mediaIds, media.id],
              );
            else props.onChangeValue?.(media.id);
          }}
        />
      </Modal>
    </>
  );
}
