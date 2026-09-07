import { Author } from "@isis/common/dto/author";
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

type AuthorSelectorProps = {
  open?: boolean;
  onClose?: () => void;
  label: ReactNode;
  description?: ReactNode;
  filters?: Omit<
    QueryPublishersInput,
    "limit" | "page" | "offset" | "order" | "sort"
  >;
  isDisabled?: (media: Author) => boolean;
  loading?: Slot<() => ReactNode>;
  optionText?: Slot<(publisher: Author) => string>;
} & (
  | ({ multiple: true } & BaseInputProps<ID<"Author">[]>)
  | ({ multiple?: false } & BaseInputProps<ID<"Author">>)
);

export function AuthorSelector({
  filters,
  optionText = (publisher) => publisher.name,
  ...props
}: AuthorSelectorProps) {
  const authorsQuery = useInfiniteQuery(
    orpcQuery.authors.query.infiniteOptions({
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
  const authorIds = props.multiple
    ? (props.value ?? [])
    : props.value
      ? [props.value]
      : [];
  const authorQueries = useQueries({
    queries: authorIds.map((id) =>
      orpcQuery.authors.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(authorIds.map((id, ix) => [id, queries[ix]])),
  });

  useEffect(() => {
    authorsQuery.data?.items.forEach((author) => {
      queryClient.setQueryData(
        orpcQuery.authors.get.queryKey({
          input: { id: author.id },
        }),
        author,
      );
    });
  }, [authorsQuery.data]);

  return (
    <Autocomplete
      options={uniqueBy(
        [
          ...(authorsQuery.data?.items ?? []),
          ...Object.values(authorQueries)
            .map((q) => q.data)
            .filter(isNonNullable),
        ],
        (a) => a.id,
      )}
      isVisible={(a) => authorsQuery.data?.items.includes(a) ?? false}
      optionId={(publisher) => publisher.id}
      optionText={optionText}
      onScroll={(e) => {
        if (
          e.currentTarget.scrollTop - e.currentTarget.scrollHeight < 100 &&
          authorsQuery.hasNextPage &&
          !authorsQuery.isPending
        ) {
          authorsQuery.fetchNextPage();
        }
      }}
      {...props}
    />
  );
}
