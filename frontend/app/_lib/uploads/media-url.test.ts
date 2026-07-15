import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveMediaUrl } from "./media-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("media URL resolver", () => {
  it("builds an R2 custom-domain URL without exposing S3 credentials", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_R2_PUBLIC_URL",
      "https://media.example.com/",
    );

    expect(
      resolveMediaUrl("users/user-id/posts/image name.webp"),
    ).toBe("https://media.example.com/users/user-id/posts/image%20name.webp");
  });

  it("preserves bundled asset paths", () => {
    expect(resolveMediaUrl("/assets/images/post.jpg")).toBe(
      "/assets/images/post.jpg",
    );
  });
});
