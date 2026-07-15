import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createInMemoryAuthModel } from "./support/in-memory-auth-model.js";
import { createInMemoryCommentModel } from "./support/in-memory-comment-model.js";
import { createInMemoryPostModel } from "./support/in-memory-post-model.js";

const AUTH_BASE = "/api/v1/auth";
const POSTS_BASE = "/api/v1/posts";
const COMMENTS_BASE = "/api/v1/comments";

function createTestApp() {
  const authModel = createInMemoryAuthModel();
  const postModel = createInMemoryPostModel(authModel);
  return createApp({
    checkDatabase: async () => true,
    authModel,
    postModel,
    commentModel: createInMemoryCommentModel(authModel),
  });
}

async function registerUser(
  app: ReturnType<typeof createTestApp>,
  email: string,
  firstName: string,
) {
  const response = await request(app).post(`${AUTH_BASE}/register`).send({
    firstName,
    lastName: "Ahmed",
    email,
    password: "StrongPassword123!",
  });
  return response.headers["set-cookie"][0] as string;
}

async function createPost(
  app: ReturnType<typeof createTestApp>,
  cookie: string,
  visibility: "PUBLIC" | "PRIVATE" = "PUBLIC",
) {
  const response = await request(app)
    .post(POSTS_BASE)
    .set("Cookie", cookie)
    .send({ content: "A post with comments", visibility });
  return response.body.data.post.id as string;
}

describe("comments and replies", () => {
  it("creates and cursor-paginates top-level comments", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const commenterCookie = await registerUser(
      app,
      "commenter@example.com",
      "Commenter",
    );
    const postId = await createPost(app, authorCookie);

    for (const content of ["First", "Second", "Third"]) {
      await request(app)
        .post(`${POSTS_BASE}/${postId}/comments`)
        .set("Cookie", commenterCookie)
        .send({ content });
    }

    const firstPage = await request(app)
      .get(`${POSTS_BASE}/${postId}/comments?limit=2`)
      .set("Cookie", authorCookie);
    const secondPage = await request(app)
      .get(
        `${POSTS_BASE}/${postId}/comments?limit=2&cursor=${firstPage.body.data.nextCursor}`,
      )
      .set("Cookie", authorCookie);

    expect(firstPage.status).toBe(200);
    expect(
      firstPage.body.data.comments.map(
        (comment: { content: string }) => comment.content,
      ),
    ).toEqual(["First", "Second"]);
    expect(firstPage.body.data.nextCursor).toEqual(expect.any(String));
    expect(secondPage.body.data.comments[0].content).toBe("Third");
    expect(secondPage.body.data.nextCursor).toBeNull();
  });

  it("creates one-level replies and rejects a reply to a reply", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "author@example.com", "Author");
    const postId = await createPost(app, cookie);
    const commentResponse = await request(app)
      .post(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", cookie)
      .send({ content: "Parent comment" });
    const commentId = commentResponse.body.data.comment.id as string;

    const replyResponse = await request(app)
      .post(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", cookie)
      .send({ content: "Reply", parentId: commentId });
    const replyId = replyResponse.body.data.comment.id as string;
    const nestedReplyResponse = await request(app)
      .post(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", cookie)
      .send({ content: "Nested reply", parentId: replyId });
    const replies = await request(app)
      .get(`${COMMENTS_BASE}/${commentId}/replies`)
      .set("Cookie", cookie);

    expect(replyResponse.status).toBe(201);
    expect(replyResponse.body.data.comment.parentId).toBe(commentId);
    expect(nestedReplyResponse.status).toBe(422);
    expect(nestedReplyResponse.body.error.code).toBe("INVALID_PARENT_COMMENT");
    expect(replies.body.data.comments).toEqual([
      expect.objectContaining({ content: "Reply" }),
    ]);
  });

  it("likes comments and replies idempotently and lists their likers", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const likerCookie = await registerUser(app, "liker@example.com", "Liker");
    const postId = await createPost(app, authorCookie);
    const commentResponse = await request(app)
      .post(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", authorCookie)
      .send({ content: "Like this comment" });
    const commentId = commentResponse.body.data.comment.id as string;

    const liked = await request(app)
      .post(`${COMMENTS_BASE}/${commentId}/likes`)
      .set("Cookie", likerCookie);
    const likedAgain = await request(app)
      .post(`${COMMENTS_BASE}/${commentId}/likes`)
      .set("Cookie", likerCookie);
    const likers = await request(app)
      .get(`${COMMENTS_BASE}/${commentId}/likes`)
      .set("Cookie", authorCookie);
    const unliked = await request(app)
      .delete(`${COMMENTS_BASE}/${commentId}/likes`)
      .set("Cookie", likerCookie);

    expect(liked.body.data.comment).toMatchObject({
      likeCount: 1,
      viewerHasLiked: true,
    });
    expect(likedAgain.body.data.comment.likeCount).toBe(1);
    expect(likers.body.data.users).toEqual([
      expect.objectContaining({ firstName: "Liker" }),
    ]);
    expect(unliked.body.data.comment).toMatchObject({
      likeCount: 0,
      viewerHasLiked: false,
    });
  });

  it("does not expose private posts through comment endpoints", async () => {
    const app = createTestApp();
    const authorCookie = await registerUser(app, "author@example.com", "Author");
    const viewerCookie = await registerUser(app, "viewer@example.com", "Viewer");
    const postId = await createPost(app, authorCookie, "PRIVATE");

    const createResponse = await request(app)
      .post(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", viewerCookie)
      .send({ content: "I should not see this" });
    const listResponse = await request(app)
      .get(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", viewerCookie);

    expect(createResponse.status).toBe(404);
    expect(listResponse.status).toBe(404);
  });

  it("validates comment content and identifiers", async () => {
    const app = createTestApp();
    const cookie = await registerUser(app, "author@example.com", "Author");
    const postId = await createPost(app, cookie);

    const emptyComment = await request(app)
      .post(`${POSTS_BASE}/${postId}/comments`)
      .set("Cookie", cookie)
      .send({ content: "   " });
    const invalidCommentId = await request(app)
      .post(`${COMMENTS_BASE}/not-a-uuid/likes`)
      .set("Cookie", cookie);

    expect(emptyComment.status).toBe(422);
    expect(emptyComment.body.error.code).toBe("VALIDATION_ERROR");
    expect(invalidCommentId.status).toBe(422);
  });
});
