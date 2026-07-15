import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyCommentRequest } from "./comment-gateway";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("comment gateway", () => {
  it("forwards supported comment subresources with the session", async () => {
    vi.stubEnv("API_URL", "https://api.example.com/production/");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { comments: [], nextCursor: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const commentId = "b3e857a5-bf7a-4ef1-b9d3-91a20f677718";
    const request = new Request(
      `https://app.example.com/api/v1/comments/${commentId}/replies?limit=20`,
      { headers: { cookie: "session=token" } },
    );

    const response = await proxyCommentRequest(request, [
      commentId,
      "replies",
    ]);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.example.com/production/api/v1/comments/${commentId}/replies?limit=20`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects unsupported comment paths and methods", async () => {
    const commentId = "b3e857a5-bf7a-4ef1-b9d3-91a20f677718";
    const response = await proxyCommentRequest(
      new Request(
        `https://app.example.com/api/v1/comments/${commentId}/replies`,
        { method: "DELETE" },
      ),
      [commentId, "replies"],
    );

    expect(response.status).toBe(404);
  });
});
