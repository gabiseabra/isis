import { oc } from "@orpc/contract";
import { EmptyObject } from "../types/object";
import { users } from "./admin/users";

export const adminApi = oc.router({ users });
export type adminApi = typeof adminApi;
export type context = EmptyObject;
