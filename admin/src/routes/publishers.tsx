import { ID } from "@isis/common/utils/id";
import { Text } from "@isis/ui/display/Text";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { Pagination } from "@isis/ui/layout/Pagination";
import { Table } from "@isis/ui/layout/Table";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiPlus, BiSearch } from "react-icons/bi";
import { TbListSearch } from "react-icons/tb";
import { useDebounceValue } from "usehooks-ts";
import { Loading } from "../components/layout/Loading";
import { authLoader } from "../loaders/authLoader";
import { orpcQuery } from "../orpc/client";

export const path = "/publishers";

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  const initialPageParam = 1;
  const [currentPage, setCurrentPage] = useState(initialPageParam);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 250);
  const publishersQuery = useQuery(
    orpcQuery.publishers.query.queryOptions({
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
        <Text as="h1">Editoras</Text>

        <Button left={<BiPlus />} size="s" variant="primary">
          Adicionar Editora
        </Button>
      </Row>

      <Table
        columns={["id", "name", "createdAt", "updatedAt"]}
        rows={publishersQuery.data?.items ?? []}
        loading={publishersQuery.isFetching}
        headerCell={(col) =>
          ({
            id: "ID",
            name: "Nome",
            createdAt: "Criado",
            updatedAt: "Modificado",
          })[col]
        }
        cell={(row, col) =>
          ({
            id: ID.parse(row.id).id,
            name: row.name,
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
            loading={publishersQuery.isFetching}
            hasNextPage={publishersQuery.data?.hasNextPage}
          />
        }
      />
    </Col>
  );
}
