import { AuthorInput } from "@isis/common/dto/author/input";
import { extractErrorMessage } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { Text } from "@isis/ui/display/Text";
import { useToast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { useForm } from "@isis/ui/form/use-form";
import { Card } from "@isis/ui/layout/Card";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Loading } from "../components/layout/Loading";
import { authLoader } from "../loaders/authLoader";
import { orpcQuery, queryClient } from "../orpc/client";

export const path = "/author/:id";

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const id =
    params.id === "new"
      ? null
      : ID.create("Author", parseInt(params.id ?? "", 10));

  const authorQuery = useQuery(
    orpcQuery.authors.get.queryOptions({ input: id ? { id } : skipToken }),
  );

  const authorMutation = useMutation(
    orpcQuery.authors.upsert.mutationOptions({
      onSuccess(author) {
        toast.show({
          type: "success",
          message: `Autor ${id ? "atualizado" : "criado"}.`,
        });

        queryClient.setQueryData(
          orpcQuery.authors.get.queryKey({ input: { id: author.id } }),
          author,
        );

        form.reset();

        if (!id)
          navigate(`/author/${ID.parse(author.id).id}`, { replace: true });
      },
      onError(error) {
        toast.show({
          type: "error",
          title: `Um erro ocorreu ${id ? "atualizando" : "criando"} o autor`,
          message: extractErrorMessage(error),
        });
      },
    }),
  );

  const form = useForm({
    schema: AuthorInput,
    initialValue: {
      name: "",
      ...authorQuery.data,
    },
    onSubmit(author) {
      authorMutation.mutate(author);
    },
  });

  useEffect(() => {
    form.reset();
  }, [authorQuery.data]);

  return (
    <Col asChild flex={1} width="wide">
      <form onSubmit={form.submit}>
        <Row alignY="center" alignX="space-between">
          <Text as="h1">{id ? "Editar autor" : "Criar autor"}</Text>

          <Button
            type="submit"
            variant="primary"
            loading={
              (!!id && authorQuery.isPending) || authorMutation.isPending
            }
          >
            Salvar
          </Button>
        </Row>

        <Card elevation={2} p={4}>
          <Text as="h4" mt={0}>
            Propriedades
          </Text>

          <Input
            label="Nome"
            disabled={!!id && authorQuery.isPending}
            {...form.register("name")}
          />
        </Card>
      </form>
    </Col>
  );
}
