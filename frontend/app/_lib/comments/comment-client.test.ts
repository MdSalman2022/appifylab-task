import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createComment,
  likeComment,
  listCommentLikers,
  listComments,
  listReplies,
} from "./comment-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

const comment = {
  id: "b3e857a5-bf7a-4ef1-b9d3-91a20f677718",
  postId: "a68d741c-79b7-4412-b1a5-bca41d56bfff",
  authorId: "dda33d2f-f976-4456-a2fc-4980528e7e1a",
  parentId: null,
  content: "A useful comment",
  likeCount: 0,
  replyCount: 0,
  viewerHasLiked: false,
  createdAt: "2026-07-14T10:00:00.000Z",
  author: {
    id: "dda33d2f-f976-4456-a2fc-4980528e7e1a",
    firstName: "Salman",
    lastName: "Ahmed",
    avatarKey: null,
  },
} as const;

describe("comment client", () => {
  it("creates and lists comments through the post resource", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ data: { comment } }))
      .mockResolvedValueOnce(
        Response.json({ data: { comments: [comment], nextCursor: null } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await createComment(comment.postId, { content: comment.content });
    const page = await listComments(comment.postId);

    expect(page.comments[0].content).toBe(comment.content);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `/api/v1/posts/${comment.postId}/comments`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("lists replies and manages comment likes", async () => {
    const reply = { ...comment, parentId: comment.id };
    const liked = { ...comment, likeCount: 1, viewerHasLiked: true };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ data: { comments: [reply], nextCursor: null } }),
      )
      .mockResolvedValueOnce(Response.json({ data: { comment: liked } }))
      .mockResolvedValueOnce(
        Response.json({ data: { users: [comment.author], nextCursor: null } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const replies = await listReplies(comment.id);
    const likedComment = await likeComment(comment.id);
    const likers = await listCommentLikers(comment.id);

    expect(replies.comments[0].parentId).toBe(comment.id);
    expect(likedComment.viewerHasLiked).toBe(true);
    expect(likers.users[0].firstName).toBe("Salman");
  });
});
