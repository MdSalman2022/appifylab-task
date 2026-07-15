import { afterEach, describe, expect, it, vi } from "vitest";

import { uploadPostImage, validatePostImage } from "./upload-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("post image upload client", () => {
  it("uploads directly to the signed R2 URL and returns the object key", async () => {
    const file = new File([new Uint8Array(512)], "photo.webp", {
      type: "image/webp",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          data: {
            upload: {
              key: "users/user-id/posts/image-id.webp",
              uploadUrl:
                "https://account.r2.cloudflarestorage.com/signed-upload",
              expiresAt: "2026-07-14T12:05:00.000Z",
              requiredHeaders: { "Content-Type": "image/webp" },
            },
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const key = await uploadPostImage(file);

    expect(key).toBe("users/user-id/posts/image-id.webp");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://account.r2.cloudflarestorage.com/signed-upload",
      {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: file,
      },
    );
  });

  it("rejects unsupported or oversized images before making a request", () => {
    const unsupported = new File(["data"], "photo.gif", {
      type: "image/gif",
    });
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "photo.jpg", {
      type: "image/jpeg",
    });

    expect(() => validatePostImage(unsupported)).toThrow(
      "Choose a JPEG, PNG, or WebP image",
    );
    expect(() => validatePostImage(oversized)).toThrow(
      "Choose an image no larger than 5 MB",
    );
  });
});
