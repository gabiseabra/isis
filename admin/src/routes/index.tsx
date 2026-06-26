import { extractErrorMessage } from "@isis/common/utils/error";
import { Text } from "@isis/ui/display/Text";
import { isRouteErrorResponse, Outlet, useRouteError } from "react-router";
import { Layout } from "../components/layout/Layout";
import * as home from "./home";
import * as login from "./login";

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

export const children = [home, login];

function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.statusText
    : extractErrorMessage(error);

  return <Text color="red">{message}</Text>;
}
