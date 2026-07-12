import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

const app = createApp({ checkDatabase: async () => true });

describe("GET /health", () => {
  it("returns the service status without exposing implementation details", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: "ok",
        database: { status: "online" },
      },
    });
  });

  it("returns 503 without exposing details when the database is offline", async () => {
    const offlineApp = createApp({ checkDatabase: async () => false });

    const response = await request(offlineApp).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      data: {
        status: "degraded",
        database: { status: "offline" },
      },
    });
  });

  it("returns the standard error shape for an unknown route", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

  it("only allows the configured frontend origin to make browser requests", async () => {
    const response = await request(app)
      .options("/health")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });
});
