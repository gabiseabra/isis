import { adminApi } from "@isis/common/orpc/admin";
import { createErrorHandler } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { createSession } from "../../services/sessions/create";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.users).$context<ORPCContext>();

export const users = c.router({
  me: c.me.use(requireAuth).handler(async ({ context }) => {
    return context.user;
  }),

  login: c.login.handler(async ({ input, errors }) => {
    const { user, token } = await createSession(input).catch(
      createErrorHandler().catch(createSession.UnauthorizedError, () => {
        throw errors.UNAUTHORIZED();
      }),
    );
    return {
      token,
      user,
    };
  }),
});
