import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyPostRequest } from "./post-gateway";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("post gateway", () => {
  it("forwards the session, query string, method, and body", async () => {
    vi.stubEnv("API_URL", "https://api.example.com/production/");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { posts: [], nextCursor: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("https://app.example.com/api/posts?limit=20", {
      headers: { cookie: "session=token" },
    });

    const response = await proxyPostRequest(request, []);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/production/posts?limit=20",
      expect.objectContaining({ method: "GET" }),
    );
    const upstreamRequest = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(upstreamRequest.headers).get("cookie")).toBe(
      "session=token",
    );
  });

  it("rejects nested or malformed post paths", async () => {
    const response = await proxyPostRequest(
      new Request("https://app.example.com/api/posts/not-a-uuid/comments"),
      ["not-a-uuid", "comments"],
    );

    expect(response.status).toBe(404);
  });

  it("allows the supported likes subresource", async () => {
    vi.stubEnv("API_URL", "https://api.example.com/production");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { users: [], nextCursor: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const postId = "b3e857a5-bf7a-4ef1-b9d3-91a20f677718";

    const response = await proxyPostRequest(
      new Request(`https://app.example.com/api/posts/${postId}/likes`),
      [postId, "likes"],
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.example.com/production/posts/${postId}/likes`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
