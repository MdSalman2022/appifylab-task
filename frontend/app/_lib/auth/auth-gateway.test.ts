import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyAuthRequest } from "./auth-gateway";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("auth gateway", () => {
  it("forwards credentials and returns the upstream session cookie", async () => {
    vi.stubEnv("API_URL", "https://api.example.com/production/");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { user: { id: "user-1" } } }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "session=token; HttpOnly; Secure; SameSite=None; Path=/",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("https://app.example.com/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=existing",
      },
      body: JSON.stringify({ email: "salman@example.com", password: "password" }),
    });

    const response = await proxyAuthRequest(request, "login");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/production/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
    const upstreamRequest = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(upstreamRequest.headers).get("cookie")).toBe(
      "session=existing",
    );
    expect(response.headers.get("set-cookie")).toContain("session=token");
    expect(response.headers.get("set-cookie")).toContain("SameSite=Lax");
  });

  it("rejects paths outside the auth endpoint allowlist", async () => {
    const response = await proxyAuthRequest(
      new Request("https://app.example.com/api/auth/admin"),
      "admin",
    );

    expect(response.status).toBe(404);
  });
});
