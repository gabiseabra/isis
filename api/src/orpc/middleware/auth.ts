import { createErrorHandler } from "@isis/common/utils/error";
import { os } from "@orpc/server";
import { verifySession } from "../../services/sessions/verify";
import { ORPCContext } from "../context";

export const requireAuth = os
  .$context<ORPCContext>()
  .errors({
    UNAUTHORIZED: {
      message: "Unauthorized",
      status: 401,
    },
  })
  .middleware(async ({ context, next, errors }) => {
    const authorization = context.request.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer "))
      throw errors.UNAUTHORIZED();
    const token = authorization.slice(7);
    return next({
      context: {
        ...context,
        ...(await verifySession(token).catch<never>(
          createErrorHandler().catch(verifySession.UnauthorizedError, () => {
            throw errors.UNAUTHORIZED();
          }),
        )),
      },
    });
  });
