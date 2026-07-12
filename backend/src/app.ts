import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import { checkDatabaseConnection } from "./lib/database-health.js";

type AppDependencies = {
  checkDatabase: () => Promise<boolean>;
};

export function createApp(
  dependencies: AppDependencies = { checkDatabase: checkDatabaseConnection },
) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.APP_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", async (_request, response) => {
    const isDatabaseOnline = await dependencies.checkDatabase();

    response.status(isDatabaseOnline ? 200 : 503).json({
      data: {
        status: isDatabaseOnline ? "ok" : "degraded",
        database: {
          status: isDatabaseOnline ? "online" : "offline",
        },
      },
    });
  });

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      console.error("Unhandled API error", error);

      if (response.headersSent) {
        return;
      }

      response.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      });
    },
  );

  return app;
}

export const app = createApp();
