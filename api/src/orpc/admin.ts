import { adminApi } from "@isis/common/orpc/admin";
import { implement, type Router } from "@orpc/server";
import { countries } from "./admin/countries";
import { languages } from "./admin/languages";
import { users } from "./admin/users";
import { ORPCContext } from "./context";

const c = implement(adminApi).$context<ORPCContext>();

export const adminRouter: Router<adminApi, ORPCContext> = c.router({
  users,
  countries,
  languages,
});
