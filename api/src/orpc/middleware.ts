import { RPCHandler } from "@orpc/server/node";
import { Router } from "express";
import { ORPCContext } from "./context";

export function orpcMiddleware(
  prefix: `/${string}`,
  handler: RPCHandler<ORPCContext>,
) {
  const router = Router();

  router.use(prefix, async (req, res, next) => {
    const { matched } = await handler.handle(req, res, {
      prefix,
      context: {
        request: req,
      },
    });

    if (matched) return;

    next();
  });

  return router;
}
