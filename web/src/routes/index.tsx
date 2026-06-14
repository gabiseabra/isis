import { Outlet } from "react-router";
import { Layout } from "../components/layout/Layout";
import * as home from "./home";

export const element = (
  <Layout>
    <Outlet />
  </Layout>
);

export const children = [home];
