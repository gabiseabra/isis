import { Request, Response } from "express";

export type ORPCContext = {
  request: Pick<Request, "headers" | "cookies" | "signedCookies">;
  response: Pick<Response, "cookie">;
};
