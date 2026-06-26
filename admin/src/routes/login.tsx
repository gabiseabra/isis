import {
  extractErrorCode,
  extractErrorMessage,
} from "@isis/common/utils/error";
import { Banner } from "@isis/ui/feedback/Banner";
import { Button } from "@isis/ui/form/Button";
import { Field } from "@isis/ui/form/Field";
import { Input } from "@isis/ui/form/Input";
import { Card } from "@isis/ui/layout/Card";
import { Col } from "@isis/ui/layout/FlexBox";
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
    <Card elevation={2} p={4} width="narrow">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate({ email, password });
        }}
      >
        <Col gap={2}>
          {loginMutation.isError &&
            (extractErrorCode(loginMutation.error) === 401 ? (
              <Banner type="error" title="Login ou senha inválidos" />
            ) : (
              <Banner type="error" title="Error ao fazer login">
                {extractErrorMessage(loginMutation.error)}
              </Banner>
            ))}

          <Field required id="email" label="Email">
            <Input
              type="email"
              value={email}
              onChangeValue={setEmail}
              autoComplete="email"
            />
          </Field>

          <Field required id="password" label="Password">
            <Input
              type="password"
              value={password}
              onChangeValue={setPassword}
              autoComplete="current-password"
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="l"
            loading={loginMutation.isPending}
          >
            Login
          </Button>
        </Col>
      </form>
    </Card>
  );
}
