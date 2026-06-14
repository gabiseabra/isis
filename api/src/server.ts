import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";

async function createServer() {
  const app = express();

  app.use(cors({ origin: (process.env.CORS_ORIGIN ?? "").split(",") }));
  app.use(morgan("dev"));

  const server = app.listen(process.env.API_PORT, () => {
    console.log(
      `Running a API server on http://localhost:${process.env.API_PORT ?? 6666}`,
    );
  });

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

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
