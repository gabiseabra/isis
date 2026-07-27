import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { adminRouter } from "./orpc/admin";
import { nodeRPCHandler } from "./orpc/handler";
import { orpcMiddleware } from "./orpc/middleware";
import { errorMiddleware } from "./services/error/middleware";
import { downloadMediaMiddleware } from "./services/media/download-middleware";
import { shutDown } from "./services/runtime/shut-down";
import { authMiddleware } from "./services/sessions/auth-middleware";

dotenv.config({ path: "../.env" });
dotenv.config({ path: "../.env.local", override: true });
dotenv.config({
  path: `../.env.${process.env.NODE_ENV ?? "development"}`,
  override: true,
});

const API_PORT = Number(process.env.API_PORT ?? 6660);

async function createServer() {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: (process.env.CORS_ORIGIN ?? "").split(","),
    }),
  );
  app.use(morgan("dev"));

  app.use("/admin/media", authMiddleware, downloadMediaMiddleware());

  app.use(orpcMiddleware("/admin/api", nodeRPCHandler(adminRouter)));

  app.use(errorMiddleware);

  const server = app.listen(API_PORT, () => {
    console.log(`Running a API server on http://localhost:${API_PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    await shutDown();

    server.close(() => {
      console.log("HTTP server closed");
    });
  };

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
  process.once("exit", () => void shutdown());
}

createServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
