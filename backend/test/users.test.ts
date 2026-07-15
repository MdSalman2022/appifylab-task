import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createInMemoryUserModels } from "./support/in-memory-user-model.js";

const AUTH_BASE = "/api/v1/auth";
const USERS_BASE = "/api/v1/users";

function createTestApp() {
  const { authModel, userModel } = createInMemoryUserModels();
  return createApp({
    checkDatabase: async () => true,
    authModel,
    userModel,
  });
}

async function registerUser(app: ReturnType<typeof createApp>, name: string) {
  const response = await request(app).post(`${AUTH_BASE}/register`).send({
    firstName: name,
    lastName: "Example",
    email: `${name.toLowerCase()}@example.com`,
    password: "StrongPassword123!",
  });
  return response.headers["set-cookie"][0].split(";")[0];
}

describe("users", () => {
  it("requires authentication to list users", async () => {
    const response = await request(createTestApp()).get(USERS_BASE);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("lists other users without exposing emails or password hashes", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "Viewer");
    await registerUser(app, "Alpha");
    await registerUser(app, "Beta");

    const response = await request(app).get(USERS_BASE).set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.data.users).toHaveLength(2);
    expect(
      response.body.data.users.map((user: { firstName: string }) => user.firstName),
    ).toEqual(["Alpha", "Beta"]);
    for (const user of response.body.data.users) {
      expect(user).not.toHaveProperty("email");
      expect(user).not.toHaveProperty("passwordHash");
      expect(user).toHaveProperty("avatarKey");
    }
  });

  it("bounds the requested page size", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "Viewer");

    const response = await request(app)
      .get(`${USERS_BASE}?limit=999`)
      .set("Cookie", cookie);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
