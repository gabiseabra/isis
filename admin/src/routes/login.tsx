import {
  extractErrorCode,
  extractErrorMessage,
} from "@isis/common/utils/error";
import { Text } from "@isis/ui/display/Text";
import { Banner } from "@isis/ui/feedback/Banner";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { Card } from "@isis/ui/layout/Card";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { orpcQuery, queryClient, setToken } from "../orpc/client";

export const path = "/login";

export function Component() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation(
    orpcQuery.users.login.mutationOptions({
      onSuccess({ user, token }) {
        setToken(token);
        queryClient.setQueryData(orpcQuery.users.me.queryKey(), user);
        navigate("/");
      },
    }),
  );

  return (
    <Card asChild gap={2} elevation={2} p={4} width="narrow">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate({ email, password });
        }}
      >
        <Text as="h2" m={0} align="center">
          Biblioteca Isis
        </Text>

        <Text as="h5" mt={-1} mb={2} align="center">
          Painel de administração
        </Text>

        {loginMutation.isError &&
          (extractErrorCode(loginMutation.error) === 401 ? (
            <Banner type="error" title="Login ou senha inválidos" />
          ) : (
            <Banner type="error" title="Error ao fazer login">
              {extractErrorMessage(loginMutation.error)}
            </Banner>
          ))}

        <Input
          required
          id="email"
          label="Email"
          type="email"
          value={email}
          onChangeValue={setEmail}
          autoComplete="email"
        />

        <Input
          required
          id="password"
          label="Senha"
          type="password"
          value={password}
          onChangeValue={setPassword}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="l"
          loading={loginMutation.isPending}
        >
          Entrar
        </Button>
      </form>
    </Card>
  );
}
