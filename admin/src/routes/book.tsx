import { BookInput } from "@isis/common/dto/book/input";
import { BookStatus } from "@isis/common/dto/book/status";
import { UUID } from "@isis/common/dto/uuid";
import { extractErrorMessage } from "@isis/common/utils/error";
import { isNonNullable } from "@isis/common/utils/guards";
import { ID } from "@isis/common/utils/id";
import { Text } from "@isis/ui/display/Text";
import { useToast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Select } from "@isis/ui/form/Select";
import { useForm } from "@isis/ui/form/use-form";
import { Card } from "@isis/ui/layout/Card";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AuthorSelector } from "../components/form/AuthorSelector";
import { LanguageSelector } from "../components/form/LanguageSelector";
import { PublisherSelector } from "../components/form/PublisherSelector";
import { Loading } from "../components/layout/Loading";
import { authLoader } from "../loaders/authLoader";
import { orpcQuery, queryClient } from "../orpc/client";

export const path = "/book/:id";

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const uuid = UUID.safeParse(params.id).data;
  const id =
    !uuid && params.id === "new"
      ? null
      : ID.create("Book", parseInt(params.id ?? "", 10));

  const bookQuery = useQuery(
    orpcQuery.books.get.queryOptions({ input: id ? { id } : skipToken }),
  );
  const draftQuery = useQuery(
    orpcQuery.books.drafts.get.queryOptions({
      input: id ? { id } : uuid ? { uuid } : skipToken,
    }),
  );

  const draftMutation = useMutation(
    orpcQuery.books.drafts.upsert.mutationOptions({
      onSuccess(draft) {
        toast.show({
          type: "success",
          message: `Livro ${id ? "atualizado" : "criado"}.`,
        });

        queryClient.setQueryData(
          orpcQuery.books.drafts.get.queryKey({
            input: { uuid: draft.data.uuid },
          }),
          draft,
        );
        if (draft.data.bookId)
          queryClient.setQueryData(
            orpcQuery.books.drafts.get.queryKey({
              input: { id: draft.data.bookId },
            }),
            draft,
          );

        form.reset();

        if (!id && !uuid)
          navigate(`/book/${draft.data.uuid}`, { replace: true });
      },
      onError(error) {
        toast.show({
          type: "error",
          title: `Um erro ocorreu ${id ? "atualizando" : "criando"} o livro`,
          message: extractErrorMessage(error),
        });
      },
    }),
  );

  const form = useForm({
    schema: BookInput,
    initialValue: BookInput.default(draftQuery.data?.data ?? {}),
    onSubmit(author) {
      draftMutation.mutate(author);
    },
  });

  useEffect(() => {
    form.reset();
  }, [draftQuery.data]);

  const isPending =
    (!!id && bookQuery.isPending) || (!!(uuid || id) && draftQuery.isPending);
  const isMutating = draftMutation.isPending;

  return (
    <Col asChild flex={1} gap={3} width="wide">
      <form onSubmit={form.submit}>
        <Row alignY="center" mb={-3} alignX="space-between">
          <Text as="h1">{id ? "Editar livro" : "Criar livro"}</Text>

          <Button
            type="submit"
            variant="primary"
            loading={isPending || isMutating}
          >
            Salvar
          </Button>
        </Row>

        <Card elevation={2} p={4}>
          <Text as="h4" mt={0}>
            Propriedades
          </Text>

          <Input
            label="Título"
            disabled={isPending}
            {...form.register("title")}
          />

          <Select
            label="Status"
            disabled={isPending || !!draftQuery.data}
            options={BookStatus.options}
            optionId={(status) => status}
            optionText={(status) =>
              ({
                published: "Publicado",
                unpublished: "Não publicado",
              })[status]
            }
            {...form.register("status")}
          />

          <Input label="ISBN" disabled={isPending} {...form.register("isbn")} />

          <PublisherSelector
            label="Editora"
            {...form.register("publisher", {
              get: (publisher) => publisher?.id,
              set: (_, id) => (id ? { id } : undefined),
            })}
          />

          <AuthorSelector
            label="Autor"
            multiple
            {...form.register("authors", {
              get: (authors) => authors.map((a) => a.id).filter(isNonNullable),
              set: (_, ids) => ids.map((id) => ({ id })),
            })}
          />

          <LanguageSelector
            label="Língua"
            multiple
            {...form.register("languages")}
          />
        </Card>

        <Card elevation={2} p={4}>
          <Text as="h4" mt={0}>
            Páginas
          </Text>
        </Card>
      </form>
    </Col>
  );
}
