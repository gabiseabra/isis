import { createErrorHandler, never } from "@isis/common/utils/error";
import { os } from "@orpc/server";
import { getAuthCookie } from "../../services/sessions/cookie";
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
    const token = getAuthCookie(context) ?? never(errors.UNAUTHORIZED());

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
