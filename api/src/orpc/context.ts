import { Request, Response } from "express";

export type ORPCContext = {
  request: Pick<Request, "headers">;
  response: Pick<Response, "cookie">;
};
