import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";

const c = implement(adminApi.users);

export const users = c.router({
  me: c.me.handler(async ({ errors }) => {
    throw errors.UNAUTHORIZED();
  }),

  loginWithPassword: c.loginWithPassword.handler(async ({ errors }) => {
    throw errors.UNAUTHORIZED();
  }),
});
