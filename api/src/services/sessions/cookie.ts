import { ORPCContext } from "../../orpc/context";

const AUTHORIZATION_COOKIE = "isis-authorization";

export function getAuthCookie(context: ORPCContext) {
  const authorization =
    context.request.headers.authorization ??
    context.request.cookies[AUTHORIZATION_COOKIE] ??
    context.request.signedCookies[AUTHORIZATION_COOKIE];
  if (!authorization || !authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7);
}

export function setAuthCookie(context: ORPCContext, token: string) {
  context.response.cookie(AUTHORIZATION_COOKIE, `Bearer ${token}`, {
    maxAge: 60_000,
    httpOnly: true,
  });
}
