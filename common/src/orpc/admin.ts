import { oc } from "@orpc/contract";
import { EmptyObject } from "../types/object";
import { countries } from "./admin/countries";
import { languages } from "./admin/languages";
import { users } from "./admin/users";

export const adminApi = oc.router({ users, countries, languages });
export type adminApi = typeof adminApi;
export type context = EmptyObject;
