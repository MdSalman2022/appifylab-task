import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.API_BASE_PATH = "/production";
  process.env.DUMMY_PASSWORD_HASH =
    "$2b$12$C6UzMDM.H6dfI/f/IKcEe.3sULw94m7tHdS7JVhTgQmS1qY9NwX4K";
});

describe("Lambda handler", () => {
  it("parses JSON request bodies from HTTP API events", async () => {
    const { handler } = await import("../src/handler.js");
    const response = await handler(
      {
        version: "2.0",
        routeKey: "ANY /{proxy+}",
        rawPath: "/production/api/v1/auth/login",
        rawQueryString: "",
        headers: {
          "content-type": "application/json",
        },
        requestContext: {
          accountId: "test",
          apiId: "test",
          domainName: "test.execute-api.local",
          domainPrefix: "test",
          http: {
            method: "POST",
            path: "/production/api/v1/auth/login",
            protocol: "HTTP/1.1",
            sourceIp: "127.0.0.1",
            userAgent: "vitest",
          },
          requestId: "test-request",
          routeKey: "ANY /{proxy+}",
          stage: "production",
          time: "15/Jul/2026:00:00:00 +0000",
          timeEpoch: 0,
        },
        body: JSON.stringify({
          email: "not-an-email",
          password: "provided-password",
          rememberMe: false,
        }),
        isBase64Encoded: false,
      } as never,
      {} as never,
    );

    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body)).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid login details",
        details: {
          email: expect.any(Array),
        },
      },
    });
  });
});
