import { requestJson } from "../api/api-client";
import { COMMENTS_API_PATH, POSTS_API_PATH } from "../api/api-paths";
import {
  commentLikersResponseSchema,
  commentPageResponseSchema,
  commentResponseSchema,
  type CommentLikersPage,
  type CommentPage,
  type CreateCommentInput,
  type FeedComment,
} from "./comment-contract";

function pageQuery(cursor?: string) {
  const query = new URLSearchParams({ limit: "20" });
  if (cursor) query.set("cursor", cursor);
  return query;
}

export async function listComments(
  postId: string,
  cursor?: string,
): Promise<CommentPage> {
  const response = await requestJson(
    `${POSTS_API_PATH}/${postId}/comments?${pageQuery(cursor)}`,
    { method: "GET" },
    commentPageResponseSchema,
  );
  return response.data;
}

export async function listReplies(
  commentId: string,
  cursor?: string,
): Promise<CommentPage> {
  const response = await requestJson(
    `${COMMENTS_API_PATH}/${commentId}/replies?${pageQuery(cursor)}`,
    { method: "GET" },
    commentPageResponseSchema,
  );
  return response.data;
}

export async function createComment(
  postId: string,
  input: CreateCommentInput,
): Promise<FeedComment> {
  const response = await requestJson(
    `${POSTS_API_PATH}/${postId}/comments`,
    { method: "POST", body: JSON.stringify(input) },
    commentResponseSchema,
  );
  return response.data.comment;
}

export async function likeComment(commentId: string): Promise<FeedComment> {
  const response = await requestJson(
    `${COMMENTS_API_PATH}/${commentId}/likes`,
    { method: "POST" },
    commentResponseSchema,
  );
  return response.data.comment;
}

export async function unlikeComment(commentId: string): Promise<FeedComment> {
  const response = await requestJson(
    `${COMMENTS_API_PATH}/${commentId}/likes`,
    { method: "DELETE" },
    commentResponseSchema,
  );
  return response.data.comment;
}

export async function listCommentLikers(
  commentId: string,
  cursor?: string,
): Promise<CommentLikersPage> {
  const response = await requestJson(
    `${COMMENTS_API_PATH}/${commentId}/likes?${pageQuery(cursor)}`,
    { method: "GET" },
    commentLikersResponseSchema,
  );
  return response.data;
}
