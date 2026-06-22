import { oc } from "@orpc/contract";
import z from "zod";
import { User } from "../../dto/user/user";

export const LoginWithPasswordInput = z.object({
  login: z.string(),
  password: z.string(),
});
export type LoginWithPasswordInput = z.infer<typeof LoginWithPasswordInput>;

export const users = oc.prefix("/users").router({
  me: oc
    .route({
      description: "Get currently authenticated user.",
    })
    .errors({
      UNAUTHORIZED: {
        message: "Unauthorized.",
        status: 401,
      },
    })
    .input(z.void())
    .output(User),

  loginWithPassword: oc
    .route({
      description: "Login with email and password.",
    })
    .errors({
      UNAUTHORIZED: {
        message: "Unauthorized.",
        status: 401,
      },
    })
    .input(LoginWithPasswordInput)
    .output(
      z.object({
        user: User,
        token: z.string(),
      }),
    ),
});
