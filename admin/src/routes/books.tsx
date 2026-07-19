import { Text } from "@isis/ui/display/Text";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { Pagination } from "@isis/ui/layout/Pagination";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiPlus, BiSearch } from "react-icons/bi";
import { Link } from "react-router";
import { useDebounceValue } from "usehooks-ts";
import { Loading } from "../components/layout/Loading";
import { BooksTable } from "../components/tables/BooksTable";
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

      <BooksTable
        rows={booksQuery.data?.items ?? []}
        loading={booksQuery.isFetching}
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
