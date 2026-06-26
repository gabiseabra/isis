import { Col } from "@isis/ui/layout/FlexBox";
import { Loading } from "../components/layout/Loading";
import { authLoader } from "../loaders/authLoader";

export const index = true;

export const loader = authLoader;

export const HydrateFallback = Loading;

export function Component() {
  return <Col>lmao</Col>;
}
