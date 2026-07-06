import { ID } from "@isis/common/utils/id";
import { Text } from "@isis/ui/display/Text";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { Pagination } from "@isis/ui/layout/Pagination";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiPlus, BiSearch } from "react-icons/bi";
import { Link, useNavigate } from "react-router";
import { useDebounceValue } from "usehooks-ts";
import { Loading } from "../components/layout/Loading";
import { AuthorsTable } from "../components/tables/AuthorsTable";
import { authLoader } from "../loaders/authLoader";
import { orpcQuery } from "../orpc/client";

export const path = "/authors";

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 250);
  const authorsQuery = useQuery(
    orpcQuery.authors.query.queryOptions({
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
        <Text as="h1">Autores</Text>

        <Link to="/author/new">
          <Button left={<BiPlus />} size="s" variant="primary">
            Adicionar Autor
          </Button>
        </Link>
      </Row>

      <AuthorsTable
        rows={authorsQuery.data?.items ?? []}
        loading={authorsQuery.isFetching}
        header={
          <Input left={<BiSearch />} value={query} onChangeValue={setQuery} />
        }
        footer={
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            loading={authorsQuery.isFetching}
            hasNextPage={authorsQuery.data?.hasNextPage}
          />
        }
        onTableClick={(row) => navigate(`/author/${ID.parse(row.id).id}`)}
      />
    </Col>
  );
}
