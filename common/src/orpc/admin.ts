import { oc } from "@orpc/contract";
import { EmptyObject } from "../types/object";
import { authors } from "./admin/authors";
import { books } from "./admin/books";
import { countries } from "./admin/countries";
import { languages } from "./admin/languages";
import { media } from "./admin/media";
import { publishers } from "./admin/publishers";
import { users } from "./admin/users";

export const adminApi = oc.router({
  users,
  countries,
  languages,
  authors,
  publishers,
  books,
  media,
});
export type adminApi = typeof adminApi;
export type context = EmptyObject;
