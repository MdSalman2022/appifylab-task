import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createInMemoryAuthStore } from "./support/in-memory-auth-store.js";


function createTestApp() {
  return createApp({
    checkDatabase: async () => true,
    authStore: createInMemoryAuthStore(),
  });
}

describe("authentication", () => {
  it("registers a user, sets a secure session cookie, and returns the user", async () => {
    const response = await request(createTestApp()).post("/auth/register").send({
      firstName: "Salman",
      lastName: "Ahmed",
      email: "SALMAN@example.com",
      password: "StrongPassword123!",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({
      firstName: "Salman",
      lastName: "Ahmed",
      email: "salman@example.com",
    });
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(response.headers["set-cookie"][0]).toContain("session=");
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
  });

  it("rejects invalid registration input", async () => {
    const response = await request(createTestApp()).post("/auth/register").send({
      firstName: "",
      lastName: "Ahmed",
      email: "invalid",
      password: "short",
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("uses the same error for an unknown email and an incorrect password", async () => {
    const app = createTestApp();
    await request(app).post("/auth/register").send({
      firstName: "Salman",
      lastName: "Ahmed",
      email: "salman@example.com",
      password: "StrongPassword123!",
    });

    const unknown = await request(app).post("/auth/login").send({
      email: "unknown@example.com",
      password: "StrongPassword123!",
    });
    const incorrect = await request(app).post("/auth/login").send({
      email: "salman@example.com",
      password: "WrongPassword123!",
    });

    expect(unknown.status).toBe(401);
    expect(incorrect.status).toBe(401);
    expect(unknown.body).toEqual(incorrect.body);
  });

  it("only persists the login cookie when remember me is enabled", async () => {
    const app = createTestApp();
    await request(app).post("/auth/register").send({
      firstName: "Salman",
      lastName: "Ahmed",
      email: "salman@example.com",
      password: "StrongPassword123!",
    });

    const sessionOnly = await request(app).post("/auth/login").send({
      email: "salman@example.com",
      password: "StrongPassword123!",
      rememberMe: false,
    });
    const persistent = await request(app).post("/auth/login").send({
      email: "salman@example.com",
      password: "StrongPassword123!",
      rememberMe: true,
    });

    expect(sessionOnly.headers["set-cookie"][0]).not.toContain("Max-Age");
    expect(persistent.headers["set-cookie"][0]).toContain("Max-Age");
  });

  it("returns the authenticated user and invalidates the session on logout", async () => {
    const app = createTestApp();
    const registration = await request(app).post("/auth/register").send({
      firstName: "Salman",
      lastName: "Ahmed",
      email: "salman@example.com",
      password: "StrongPassword123!",
    });
    const cookie = registration.headers["set-cookie"][0];

    const me = await request(app).get("/auth/me").set("Cookie", cookie);
    const logout = await request(app).post("/auth/logout").set("Cookie", cookie);
    const afterLogout = await request(app).get("/auth/me").set("Cookie", cookie);

    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe("salman@example.com");
    expect(logout.status).toBe(204);
    expect(afterLogout.status).toBe(401);
  });
});
