import { Request } from "express";

export type ORPCContext = {
  request: Pick<Request, "headers">;
};
