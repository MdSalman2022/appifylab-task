import serverless from "serverless-http";

import { app } from "./app.js";

export const handler = serverless(app, {
  basePath: process.env.API_BASE_PATH ?? "",
});
