import { extractErrorMessage } from "@isis/common/utils/error";
import { Text } from "@isis/ui/display/Text";
import { isRouteErrorResponse, Outlet, useRouteError } from "react-router";
import { Layout } from "../components/layout/Layout";
import * as author from "./author";
import * as authors from "./authors";
import * as books from "./books";
import * as home from "./home";
import * as login from "./login";
import * as publishers from "./publishers";

export const element = (
  <Layout>
    <Outlet />
  </Layout>
);

export const errorElement = (
  <Layout>
    <RouteError />
  </Layout>
);

export const children = [home, login, publishers, authors, author, books];

function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.statusText
    : extractErrorMessage(error);

  return <Text color="red">{message}</Text>;
}
