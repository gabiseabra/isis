import { unique } from "@isis/common/utils/array";
import { isNonNullable } from "@isis/common/utils/guards";
import { ID } from "@isis/common/utils/id";
import { Badge } from "@isis/ui/display/Badge";
import { Text } from "@isis/ui/display/Text";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { Pagination } from "@isis/ui/layout/Pagination";
import { Table } from "@isis/ui/layout/Table";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BiPlus, BiSearch } from "react-icons/bi";
import { FaExclamationCircle } from "react-icons/fa";
import { TbListSearch } from "react-icons/tb";
import { Link } from "react-router";
import { useDebounceValue } from "usehooks-ts";
import { Loading } from "../components/layout/Loading";
import { authLoader } from "../loaders/authLoader";
import { orpcQuery } from "../orpc/client";

export const path = "/books";

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  const initialPageParam = 1;
  const [currentPage, setCurrentPage] = useState(initialPageParam);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 250);
  const booksQuery = useQuery(
    orpcQuery.books.query.queryOptions({
      input: {
        page: currentPage,
        limit: 25,
        query: debouncedQuery,
      },
    }),
  );

  const authorIds = useMemo(
    () =>
      unique(booksQuery.data?.items.flatMap((book) => book.authorIds) ?? []),
    [booksQuery.data],
  );
  const authorQueries = useQueries({
    queries: authorIds.map((id) =>
      orpcQuery.authors.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(authorIds.map((id, ix) => [id, queries[ix]])),
  });

  const publisherIds = useMemo(
    () =>
      unique(
        booksQuery.data?.items
          .map((book) => book.publisherId)
          .filter(isNonNullable) ?? [],
      ),
    [booksQuery.data],
  );
  const publisherQueries = useQueries({
    queries: publisherIds.map((id) =>
      orpcQuery.authors.get.queryOptions({ input: { id } }),
    ),
    combine: (queries) =>
      Object.fromEntries(publisherIds.map((id, ix) => [id, queries[ix]])),
  });

  return (
    <Col flex={1} width="auto">
      <Row alignY="center" alignX="space-between">
        <Text as="h1">Acervo</Text>

        <Link to="/book/new">
          <Button left={<BiPlus />} size="s" variant="primary">
            Adicionar Livro
          </Button>
        </Link>
      </Row>

      <Table
        columns={[
          "id",
          "title",
          "author",
          "publisher",
          "createdAt",
          "updatedAt",
        ]}
        rows={booksQuery.data?.items ?? []}
        loading={booksQuery.isFetching}
        headerCell={(col) =>
          ({
            id: "ID",
            title: "Título",
            author: "Autor",
            publisher: "Editora",
            createdAt: "Criado",
            updatedAt: "Modificado",
          })[col]
        }
        cell={(row, col) =>
          ({
            id: ID.parse(row.id).id,
            title: row.title,
            author: (() => {
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
            publisher: (() => {
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
        header={
          <Input left={<BiSearch />} value={query} onChangeValue={setQuery} />
        }
        footer={
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            loading={booksQuery.isFetching}
            hasNextPage={booksQuery.data?.hasNextPage}
          />
        }
      />
    </Col>
  );
}
