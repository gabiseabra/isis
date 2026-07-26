import {
  extractErrorCode,
  extractErrorMessage,
} from "@isis/common/utils/error";
import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) return next(error);

  const status = extractErrorCode(error);

  res.status(status ?? 500).json({
    error: status
      ? extractErrorMessage(error, "Unknown error")
      : "Internal server error",
  });
};
