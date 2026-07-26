import { NextFunction, Request, Response } from "express";
import { getAuthCookie } from "./cookie";
import { verifySession } from "./verify";

type SessionContext = Awaited<ReturnType<typeof verifySession>>;

declare global {
  namespace Express {
    interface Request {
      session?: SessionContext["session"];
      user?: SessionContext["user"];
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getAuthCookie({ request: req, response: res });
  if (!token) return res.sendStatus(401);

  try {
    Object.assign(req, await verifySession(token));
    next();
  } catch (error) {
    if (error instanceof verifySession.UnauthorizedError)
      return res.sendStatus(401);
    next(error);
  }
}
