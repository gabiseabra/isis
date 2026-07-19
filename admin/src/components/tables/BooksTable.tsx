import { Book } from "@isis/common/dto/book";
import { unique } from "@isis/common/utils/array";
import { isNonNullable } from "@isis/common/utils/guards";
import { ID } from "@isis/common/utils/id";
import { Badge } from "@isis/ui/display/Badge";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Checkbox } from "@isis/ui/form/Checkbox";
import { Table, TableProps } from "@isis/ui/layout/Table";
import { useQueries } from "@tanstack/react-query";
import { FaExclamationCircle } from "react-icons/fa";
import { TbListSearch } from "react-icons/tb";
import { orpcQuery } from "../../orpc/client";

type BooksTableProps = Omit<
  TableProps<Book, keyof Book>,
  "columns" | "cell"
> & {
  selectedIds?: Book["id"][];
  onChangeSelectedIds?: (row: Book["id"][]) => void;
  onSetSelectedIds?: (row: Book["id"][]) => void;
  onResetSelectedIds?: () => void;
};

export function BooksTable({
  rows,
  selectedIds,
  onChangeSelectedIds,
  onSetSelectedIds,
  onResetSelectedIds,
  ...props
}: BooksTableProps) {
  const authorIds = unique(rows.flatMap((book) => book.authorIds) ?? []);
  const authorQueries = useQueries({
    queries: authorIds.map((id) =>
      orpcQuery.authors.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(authorIds.map((id, ix) => [id, queries[ix]])),
  });

  const publisherIds = unique(
    rows.map((book) => book.publisherId).filter(isNonNullable) ?? [],
  );
  const publisherQueries = useQueries({
    queries: publisherIds.map((id) =>
      orpcQuery.authors.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(publisherIds.map((id, ix) => [id, queries[ix]])),
  });

  return (
    <Table
      rows={rows}
      columns={[
        "id",
        "status",
        "title",
        "authorIds",
        "publisherId",
        "publishYear",
        "createdAt",
        "updatedAt",
      ]}
      headerCell={(col) =>
        ({
          id: "ID",
          title: "Título",
          status: "Status",
          authorIds: "Autor",
          publisherId: "Editora",
          publishYear: "Publicado",
          createdAt: "Criado",
          updatedAt: "Modificado",
        })[col]
      }
      cell={(row, col) =>
        ({
          id: ID.parse(row.id).id,
          title: "Título",
          status: {
            published: (
              <Badge size="m" color="green">
                Publicado
              </Badge>
            ),
            unpublished: (
              <Badge size="m" color="green">
                Publicado
              </Badge>
            ),
          }[row.status],
          authorIds: (() => {
            const queries = row.authorIds.map((id) => authorQueries[id]);
            if (!queries.length) return "—";
            if (queries.some((q) => q.isPending)) return <Spinner size="s" />;
            return queries
              .filter((q) => !q.isPending)
              .map((q) =>
                q.isError ? (
                  <Badge size="m" color="red">
                    Erro <FaExclamationCircle color="currentColor" />
                  </Badge>
                ) : (
                  <Badge size="m" color="blue">
                    {q.data.name}
                  </Badge>
                ),
              );
          })(),
          publishYear: row.publishYear,
          publisherId: (() => {
            if (!row.publisherId) return "—";
            const query = publisherQueries[row.publisherId];
            if (query.isPending) return <Spinner size="s" />;

            if (query.isError)
              return (
                <Badge size="m" color="red">
                  Erro <FaExclamationCircle color="currentColor" />
                </Badge>
              );
            return (
              <Badge size="m" color="blue">
                {query.data.name}
              </Badge>
            );
          })(),
          createdAt: row.createdAt.toLocaleDateString(),
          updatedAt: row.updatedAt.toLocaleDateString(),
        })[col]
      }
      emptyState={
        <EmptyState
          py={4}
          size="l"
          icon={<TbListSearch />}
          title="Sem resultados"
        />
      }
      index={
        selectedIds
          ? (row) => (
              <Checkbox
                value={selectedIds.includes(row.id)}
                onChangeValue={(checked) => {
                  onChangeSelectedIds?.(
                    checked
                      ? unique([...selectedIds, row.id])
                      : (selectedIds?.filter((id) => id !== row.id) ?? []),
                  );
                }}
              />
            )
          : undefined
      }
      indexHeader={
        selectedIds ? (
          <Checkbox
            checked={
              rows.every((row) => selectedIds?.includes(row.id))
                ? true
                : selectedIds.length
                  ? "indeterminate"
                  : false
            }
            value={rows.every((row) => selectedIds.includes(row.id))}
            onChangeValue={(checked) => {
              if (checked) onSetSelectedIds?.(rows.map((row) => row.id));
              else onResetSelectedIds?.();
            }}
          />
        ) : undefined
      }
      {...props}
    />
  );
}
