import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import { checkDatabaseConnection } from "./lib/database-health.js";
import { createPrismaAuthModel, type AuthModel } from "./models/auth-model.js";
import {
  createPrismaCommentModel,
  type CommentModel,
} from "./models/comment-model.js";
import { createPrismaPostModel, type PostModel } from "./models/post-model.js";
import { createPrismaUserModel, type UserModel } from "./models/user-model.js";
import { createApiV1Routes } from "./routes/api-v1-routes.js";
import type { PostImageStorage } from "./services/post-image-storage.js";
import { createR2PostImageStorage } from "./services/r2-post-image-storage.js";

type AppDependencies = {
  checkDatabase: () => Promise<boolean>;
  authModel: AuthModel;
  postModel?: PostModel;
  commentModel?: CommentModel;
  postImageStorage?: PostImageStorage;
  userModel?: UserModel;
};

export function createApp(
  dependencies: AppDependencies = {
    checkDatabase: checkDatabaseConnection,
    authModel: createPrismaAuthModel(),
    postModel: createPrismaPostModel(),
    commentModel: createPrismaCommentModel(),
    postImageStorage: createR2PostImageStorage(),
    userModel: createPrismaUserModel(),
  },
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
  app.use(
    "/api/v1",
    createApiV1Routes(
      dependencies.authModel,
      dependencies.postModel ?? createPrismaPostModel(),
      dependencies.commentModel ?? createPrismaCommentModel(),
      dependencies.postImageStorage ?? createR2PostImageStorage(),
      dependencies.userModel ?? createPrismaUserModel(),
    ),
  );

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

      if (response.headersSent) return;

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
