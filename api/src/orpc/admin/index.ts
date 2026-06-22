import { adminApi, context } from "@isis/common/orpc/admin";
import { implement, type Router } from "@orpc/server";
import { users } from "./users";

const c = implement(adminApi);

export const adminRouter: Router<adminApi, context> = c.router({
  users,
});
