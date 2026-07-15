import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createInMemoryAuthModel } from "./support/in-memory-auth-model.js";
import { createInMemoryPostModel } from "./support/in-memory-post-model.js";

const AUTH_BASE = "/api/v1/auth";
const POSTS_BASE = "/api/v1/posts";

function createTestApp() {
  const authModel = createInMemoryAuthModel();
  return createApp({
    checkDatabase: async () => true,
    authModel,
    postModel: createInMemoryPostModel(authModel),
  });
}

async function registerUser(
  app: ReturnType<typeof createTestApp>,
  email: string,
  firstName = "Salman",
) {
  const response = await request(app).post(`${AUTH_BASE}/register`).send({
    firstName,
    lastName: "Ahmed",
    email,
    password: "StrongPassword123!",
  });
  return response.headers["set-cookie"][0] as string;
}

async function registerUserWithIdentity(
  app: ReturnType<typeof createTestApp>,
  email: string,
  firstName = "Salman",
) {
  const response = await request(app).post(`${AUTH_BASE}/register`).send({
    firstName,
    lastName: "Ahmed",
    email,
    password: "StrongPassword123!",
  });
  return {
    cookie: response.headers["set-cookie"][0] as string,
    userId: response.body.data.user.id as string,
  };
}

describe("posts", () => {
  it("requires authentication to create and read the feed", async () => {
    const app = createTestApp();

    const createResponse = await request(app).post(POSTS_BASE).send({
      content: "Hello BuddyScript",
      visibility: "PUBLIC",
    });
    const listResponse = await request(app).get(POSTS_BASE);

    expect(createResponse.status).toBe(401);
    expect(listResponse.status).toBe(401);
  });

  it("creates posts and returns the newest post first", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "salman@example.com");

    await request(app)
      .post(POSTS_BASE)
      .set("Cookie", cookie)
      .send({ content: "First post", visibility: "PUBLIC" });
    const created = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", cookie)
      .send({ content: "Newest post", visibility: "PRIVATE" });
    const feed = await request(app)
      .get(`${POSTS_BASE}?limit=10`)
      .set("Cookie", cookie);

    expect(created.status).toBe(201);
    expect(created.body.data.post).toMatchObject({
      content: "Newest post",
      visibility: "PRIVATE",
      author: { firstName: "Salman" },
    });
    expect(feed.status).toBe(200);
    expect(
      feed.body.data.posts.map((post: { content: string }) => post.content),
    ).toEqual(["Newest post", "First post"]);
  });

  it("hides private posts from other users", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const viewerCookie = await registerUser(app, "viewer@example.com", "Viewer");

    await request(app)
      .post(POSTS_BASE)
      .set("Cookie", authorCookie)
      .send({ content: "Public post", visibility: "PUBLIC" });
    await request(app)
      .post(POSTS_BASE)
      .set("Cookie", authorCookie)
      .send({ content: "Private post", visibility: "PRIVATE" });

    const feed = await request(app).get(POSTS_BASE).set("Cookie", viewerCookie);

    expect(feed.body.data.posts).toHaveLength(1);
    expect(feed.body.data.posts[0].content).toBe("Public post");
  });

  it("validates that a post contains text or an image", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "salman@example.com");

    const response = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", cookie)
      .send({ content: "   ", visibility: "PUBLIC" });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("only accepts R2 image keys owned by the authenticated user", async () => {
    const app = createTestApp();
    const user = await registerUserWithIdentity(app, "owner@example.com");
    const anotherUserId = crypto.randomUUID();

    const rejected = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", user.cookie)
      .send({
        imageKey: `users/${anotherUserId}/posts/${crypto.randomUUID()}.webp`,
        visibility: "PUBLIC",
      });
    const accepted = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", user.cookie)
      .send({
        imageKey: `users/${user.userId}/posts/${crypto.randomUUID()}.webp`,
        visibility: "PUBLIC",
      });

    expect(rejected.status).toBe(422);
    expect(rejected.body.error.code).toBe("INVALID_IMAGE_KEY");
    expect(accepted.status).toBe(201);
  });

  it("only allows an author to update or delete a post", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const otherCookie = await registerUser(app, "other@example.com", "Other");
    const created = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", authorCookie)
      .send({ content: "Original", visibility: "PUBLIC" });
    const postId = created.body.data.post.id as string;

    const forbiddenUpdate = await request(app)
      .patch(`${POSTS_BASE}/${postId}`)
      .set("Cookie", otherCookie)
      .send({ content: "Changed" });
    const updated = await request(app)
      .patch(`${POSTS_BASE}/${postId}`)
      .set("Cookie", authorCookie)
      .send({ content: "Updated" });
    const forbiddenDelete = await request(app)
      .delete(`${POSTS_BASE}/${postId}`)
      .set("Cookie", otherCookie);
    const deleted = await request(app)
      .delete(`${POSTS_BASE}/${postId}`)
      .set("Cookie", authorCookie);

    expect(forbiddenUpdate.status).toBe(403);
    expect(updated.body.data.post.content).toBe("Updated");
    expect(forbiddenDelete.status).toBe(403);
    expect(deleted.status).toBe(204);
  });

  it("preserves visibility on partial updates and supports clearing content", async () => {
    const app = createTestApp();
    const user = await registerUserWithIdentity(
      app,
      "author@example.com",
      "Author",
    );
    const imageKey = `users/${user.userId}/posts/${crypto.randomUUID()}.jpg`;
    const created = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", user.cookie)
      .send({
        content: "Original",
        imageKey,
        visibility: "PRIVATE",
      });
    const postId = created.body.data.post.id as string;

    const updated = await request(app)
      .patch(`${POSTS_BASE}/${postId}`)
      .set("Cookie", user.cookie)
      .send({ content: null });

    expect(updated.status).toBe(200);
    expect(updated.body.data.post).toMatchObject({
      content: null,
      imageKey,
      visibility: "PRIVATE",
    });
  });

  it("returns an opaque cursor when another page exists", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "salman@example.com");
    for (const content of ["One", "Two", "Three"]) {
      await request(app)
        .post(POSTS_BASE)
        .set("Cookie", cookie)
        .send({ content, visibility: "PUBLIC" });
    }

    const firstPage = await request(app)
      .get(`${POSTS_BASE}?limit=2`)
      .set("Cookie", cookie);
    const secondPage = await request(app)
      .get(`${POSTS_BASE}?limit=2&cursor=${firstPage.body.data.nextCursor}`)
      .set("Cookie", cookie);

    expect(firstPage.body.data.posts).toHaveLength(2);
    expect(firstPage.body.data.nextCursor).toEqual(expect.any(String));
    expect(
      secondPage.body.data.posts.map(
        (post: { content: string }) => post.content,
      ),
    ).toEqual(["One"]);
    expect(secondPage.body.data.nextCursor).toBeNull();
  });

  it("likes and unlikes a post idempotently and returns its likers", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const likerCookie = await registerUser(app, "liker@example.com", "Liker");
    const created = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", authorCookie)
      .send({ content: "Like this", visibility: "PUBLIC" });
    const postId = created.body.data.post.id as string;

    const liked = await request(app)
      .post(`${POSTS_BASE}/${postId}/likes`)
      .set("Cookie", likerCookie);
    const likedAgain = await request(app)
      .post(`${POSTS_BASE}/${postId}/likes`)
      .set("Cookie", likerCookie);
    const likers = await request(app)
      .get(`${POSTS_BASE}/${postId}/likes`)
      .set("Cookie", authorCookie);
    const unliked = await request(app)
      .delete(`${POSTS_BASE}/${postId}/likes`)
      .set("Cookie", likerCookie);

    expect(liked.body.data.post).toMatchObject({
      likeCount: 1,
      viewerHasLiked: true,
    });
    expect(likedAgain.body.data.post.likeCount).toBe(1);
    expect(likers.body.data.users).toEqual([
      expect.objectContaining({ firstName: "Liker" }),
    ]);
    expect(likers.body.data.nextCursor).toBeNull();
    expect(unliked.body.data.post).toMatchObject({
      likeCount: 0,
      viewerHasLiked: false,
    });
  });

  it("does not expose private posts through like endpoints", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const viewerCookie = await registerUser(app, "viewer@example.com", "Viewer");
    const created = await request(app)
      .post(POSTS_BASE)
      .set("Cookie", authorCookie)
      .send({ content: "Private", visibility: "PRIVATE" });
    const postId = created.body.data.post.id as string;

    const likeResponse = await request(app)
      .post(`${POSTS_BASE}/${postId}/likes`)
      .set("Cookie", viewerCookie);
    const likersResponse = await request(app)
      .get(`${POSTS_BASE}/${postId}/likes`)
      .set("Cookie", viewerCookie);

    expect(likeResponse.status).toBe(404);
    expect(likersResponse.status).toBe(404);
  });
});
