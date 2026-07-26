import { ORPCContext } from "../../orpc/context";
import { JWT_MAX_AGE } from "./jwt";

const AUTHORIZATION_COOKIE = "isis-authorization";

export function getAuthCookie(context: ORPCContext) {
  const cookie = context.request.headers.cookie
    ?.split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([key]) => key === AUTHORIZATION_COOKIE)?.[1];
  const authorization =
    context.request.headers.authorization ??
    (cookie && decodeURIComponent(cookie));
  if (!authorization || !authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7);
}

export function setAuthCookie(context: ORPCContext, token: string) {
  context.response.cookie(AUTHORIZATION_COOKIE, `Bearer ${token}`, {
    maxAge: JWT_MAX_AGE,
    httpOnly: true,
  });
}
