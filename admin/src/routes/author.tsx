import { ID } from "@isis/common/utils/id";
import { Text } from "@isis/ui/display/Text";
import { Button } from "@isis/ui/form/Button";
import { Field } from "@isis/ui/form/Field";
import { Input } from "@isis/ui/form/Input";
import { Card } from "@isis/ui/layout/Card";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import {
  mutationOptions,
  skipToken,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { Loading } from "../components/layout/Loading";
import { authLoader } from "../loaders/authLoader";
import { orpcQuery } from "../orpc/client";

export const path = "/author/:id";

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  const params = useParams();

  const id =
    params.id === "new"
      ? null
      : ID.create("Author", parseInt(params.id ?? "", 10));

  const authorQuery = useQuery(
    orpcQuery.authors.get.queryOptions({ input: id ? { id } : skipToken }),
  );

  const authorMutation = useMutation(
    orpcQuery.authors.upsert.mutationOptions(),
  );

  return (
    <Col flex={1} width="wide">
      <Row alignY="center" alignX="space-between">
        <Text as="h1">{id ? "Editar autor" : "Adicionar autor"}</Text>
      </Row>

      <Card elevation={2} p={4}>
        <Field required id="name" label="Nome">
          <Input />
        </Field>
      </Card>
    </Col>
  );
}
