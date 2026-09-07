import { Publisher } from "@isis/common/dto/publisher";
import { QueryPublishersInput } from "@isis/common/dto/publisher/query-input";
import { uniqueBy } from "@isis/common/utils/array";
import { isNonNullable } from "@isis/common/utils/guards";
import { ID } from "@isis/common/utils/id";
import { Slot } from "@isis/common/utils/slot";
import { Autocomplete } from "@isis/ui/form/Autocomplete";
import { BaseInputProps } from "@isis/ui/form/use-form";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { orpcQuery, queryClient } from "../../orpc/client";

type PublisherSelectorProps = {
  open?: boolean;
  onClose?: () => void;
  label: ReactNode;
  description?: ReactNode;
  filters?: Omit<
    QueryPublishersInput,
    "limit" | "page" | "offset" | "order" | "sort"
  >;
  isDisabled?: (media: Publisher) => boolean;
  loading?: Slot<() => ReactNode>;
  optionText?: Slot<(publisher: Publisher) => string>;
} & (
  | ({ multiple: true } & BaseInputProps<ID<"Publisher">[]>)
  | ({ multiple?: false } & BaseInputProps<ID<"Publisher">>)
);

export function PublisherSelector({
  filters,
  optionText = (publisher) => publisher.name,
  ...props
}: PublisherSelectorProps) {
  const publishersQuery = useInfiniteQuery(
    orpcQuery.publishers.query.infiniteOptions({
      input: (page) => ({
        page,
        limit: 25,
        ...filters,
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, _, lastPageNumber) =>
        lastPage.hasNextPage ? lastPageNumber + 1 : undefined,
      select: ({ pages }) => ({
        items: pages.flatMap((page) => page.items),
      }),
    }),
  );
  const publisherIds = props.multiple
    ? (props.value ?? [])
    : props.value
      ? [props.value]
      : [];
  const publisherQueries = useQueries({
    queries: publisherIds.map((id) =>
      orpcQuery.publishers.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(publisherIds.map((id, ix) => [id, queries[ix]])),
  });

  useEffect(() => {
    publishersQuery.data?.items.forEach((publisher) => {
      queryClient.setQueryData(
        orpcQuery.publishers.get.queryKey({
          input: { id: publisher.id },
        }),
        publisher,
      );
    });
  }, [publishersQuery.data]);

  return (
    <Autocomplete
      options={uniqueBy(
        [
          ...(publishersQuery.data?.items ?? []),
          ...Object.values(publisherQueries)
            .map((q) => q.data)
            .filter(isNonNullable),
        ],
        (p) => p.id,
      )}
      isVisible={(p) => publishersQuery.data?.items.includes(p) ?? false}
      optionId={(publisher) => publisher.id}
      optionText={optionText}
      onScroll={(e) => {
        if (
          e.currentTarget.scrollTop - e.currentTarget.scrollHeight < 100 &&
          publishersQuery.hasNextPage &&
          !publishersQuery.isPending
        ) {
          publishersQuery.fetchNextPage();
        }
      }}
      {...props}
    />
  );
}
