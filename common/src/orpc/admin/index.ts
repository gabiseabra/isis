import { oc } from "@orpc/contract";
import { EmptyObject } from "../../types/object.js";
import { users } from "./users.js";

export const adminApi = oc.router({ users });
export type adminApi = typeof adminApi;
export type context = EmptyObject;
