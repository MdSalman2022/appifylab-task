import { afterEach, describe, expect, it, vi } from "vitest";

import { createPost, likePost, listPostLikers, listPosts } from "./post-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

const post = {
  id: "b3e857a5-bf7a-4ef1-b9d3-91a20f677718",
  authorId: "a68d741c-79b7-4412-b1a5-bca41d56bfff",
  content: "Hello BuddyScript",
  imageKey: null,
  visibility: "PUBLIC",
  likeCount: 0,
  commentCount: 0,
  viewerHasLiked: false,
  createdAt: "2026-07-13T10:00:00.000Z",
  updatedAt: "2026-07-13T10:00:00.000Z",
  author: {
    id: "a68d741c-79b7-4412-b1a5-bca41d56bfff",
    firstName: "Salman",
    lastName: "Ahmed",
    avatarKey: null,
  },
} as const;

describe("post client", () => {
  it("loads a validated page of posts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { posts: [post], nextCursor: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const page = await listPosts();

    expect(page.posts[0].content).toBe("Hello BuddyScript");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/posts?limit=20",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("creates a text post", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { post } }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const created = await createPost({
      content: "Hello BuddyScript",
      visibility: "PUBLIC",
    });

    expect(created.id).toBe(post.id);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/posts",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
  });

  it("rejects malformed API data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ data: { posts: [{}] } })),
    );

    await expect(listPosts()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("likes a post and loads the validated likers list", async () => {
    const likedPost = { ...post, likeCount: 1, viewerHasLiked: true };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ data: { post: likedPost } }))
      .mockResolvedValueOnce(
        Response.json({
          data: { users: [post.author], nextCursor: null },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const liked = await likePost(post.id);
    const likers = await listPostLikers(post.id);

    expect(liked.viewerHasLiked).toBe(true);
    expect(likers.users[0].firstName).toBe("Salman");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `/api/v1/posts/${post.id}/likes`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
