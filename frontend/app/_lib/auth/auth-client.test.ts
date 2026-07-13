import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, login, logout, register } from "./auth-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("auth client", () => {
  it("logs in through the same-origin auth gateway", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: {
          user: {
            id: "user-1",
            firstName: "Salman",
            lastName: "Ahmed",
            email: "salman@example.com",
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = await login({
      email: "salman@example.com",
      password: "StrongPassword123!",
    });

    expect(user.email).toBe("salman@example.com");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
  });

  it("registers through the same-origin auth gateway", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: {
          user: {
            id: "user-1",
            firstName: "Salman",
            lastName: "Ahmed",
            email: "salman@example.com",
          },
        },
      }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await register({
      firstName: "Salman",
      lastName: "Ahmed",
      email: "salman@example.com",
      password: "StrongPassword123!",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
  });

  it("exposes structured API errors to forms", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } },
          { status: 401 },
        ),
      ),
    );

    try {
      await login({ email: "salman@example.com", password: "wrong" });
      expect.fail("Expected login to reject invalid credentials");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
        status: 401,
      });
    }
  });

  it("logs out without attempting to parse an empty response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(logout()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
  });
});
