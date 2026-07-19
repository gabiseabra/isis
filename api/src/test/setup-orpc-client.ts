import { User } from "@isis/common/dto/user";
import { CreateUserInput } from "@isis/common/dto/user/create-input";
import { AnyContractRouter } from "@orpc/contract";
import {
  createRouterClient,
  InferRouterInitialContext,
  Router,
  RouterClient,
} from "@orpc/server";
import { ORPCContext } from "../orpc/context";
import { createSessionRow } from "../services/sessions/db";
import { JWT } from "../services/sessions/jwt";
import { createUser } from "../services/users/create";

export type OrpcClient<R extends Router<AnyContractRouter, ORPCContext>> =
  RouterClient<R>;

export async function setupOrpcClient<
  R extends Router<AnyContractRouter, ORPCContext>,
>(
  router: R,
  { ...context }: InferRouterInitialContext<R>,
  loggedInUser?: Pick<User, "id"> | CreateUserInput,
): Promise<OrpcClient<R>> {
  if (loggedInUser) {
    const { id: userId } =
      "id" in loggedInUser ? loggedInUser : await createUser(loggedInUser);
    const jwt = JWT.create(userId);
    await createSessionRow(jwt.payload);
    context.request.headers.authorization = `Bearer ${jwt.token}`;
  }

  return createRouterClient(router, { context });
}
