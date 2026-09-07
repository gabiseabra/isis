import { Language } from "@isis/common/dto/language";
import { uniqueBy } from "@isis/common/utils/array";
import { isNonNullable } from "@isis/common/utils/guards";
import { Slot } from "@isis/common/utils/slot";
import { Autocomplete } from "@isis/ui/form/Autocomplete";
import { BaseInputProps } from "@isis/ui/form/use-form";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { orpcQuery, queryClient } from "../../orpc/client";

export function LanguageSelector({
  filters,
  optionText = (language) => language.name,
  ...props
}: {
  open?: boolean;
  onClose?: () => void;
  label: ReactNode;
  description?: ReactNode;
  filters?: { query?: string };
  isDisabled?: (language: Language) => boolean;
  loading?: Slot<() => ReactNode>;
  optionText?: Slot<(language: Language) => string>;
} & (
  | ({ multiple: true } & BaseInputProps<string[]>)
  | ({ multiple?: false } & BaseInputProps<string>)
)) {
  const languagesQuery = useInfiniteQuery(
    orpcQuery.languages.query.infiniteOptions({
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
  const languageCodes = props.multiple
    ? (props.value ?? [])
    : props.value
      ? [props.value]
      : [];
  const languageQueries = useQueries({
    queries: languageCodes.map((code) =>
      orpcQuery.languages.get.queryOptions({ input: { code } }),
    ),
    combine: (queries) =>
      Object.fromEntries(languageCodes.map((code, ix) => [code, queries[ix]])),
  });

  useEffect(() => {
    languagesQuery.data?.items.forEach((language) => {
      queryClient.setQueryData(
        orpcQuery.languages.get.queryKey({
          input: { code: language.code },
        }),
        language,
      );
    });
  }, [languagesQuery.data]);

  return (
    <Autocomplete
      options={uniqueBy(
        [
          ...(languagesQuery.data?.items ?? []),
          ...Object.values(languageQueries)
            .map((q) => q.data)
            .filter(isNonNullable),
        ],
        (language) => language.code,
      )}
      isVisible={(language) =>
        languagesQuery.data?.items.includes(language) ?? false
      }
      optionId={(language) => language.code}
      optionText={optionText}
      onScroll={(e) => {
        if (
          e.currentTarget.scrollTop - e.currentTarget.scrollHeight < 100 &&
          languagesQuery.hasNextPage &&
          !languagesQuery.isPending
        ) {
          languagesQuery.fetchNextPage();
        }
      }}
      {...props}
    />
  );
}
