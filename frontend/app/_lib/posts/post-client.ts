import { requestEmpty, requestJson } from "../api/api-client";
import {
  postPageResponseSchema,
  postLikersResponseSchema,
  postResponseSchema,
  type CreatePostInput,
  type FeedPost,
  type PostPage,
  type PostLikersPage,
  type UpdatePostInput,
} from "./post-contract";

export async function listPosts(cursor?: string): Promise<PostPage> {
  const query = new URLSearchParams({ limit: "20" });
  if (cursor) query.set("cursor", cursor);
  const response = await requestJson(
    `/api/posts?${query}`,
    { method: "GET" },
    postPageResponseSchema,
  );
  return response.data;
}

export async function createPost(input: CreatePostInput): Promise<FeedPost> {
  const response = await requestJson(
    "/api/posts",
    { method: "POST", body: JSON.stringify(input) },
    postResponseSchema,
  );
  return response.data.post;
}

export async function updatePost(
  postId: string,
  input: UpdatePostInput,
): Promise<FeedPost> {
  const response = await requestJson(
    `/api/posts/${postId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    postResponseSchema,
  );
  return response.data.post;
}

export function deletePost(postId: string): Promise<void> {
  return requestEmpty(`/api/posts/${postId}`, { method: "DELETE" });
}

export async function likePost(postId: string): Promise<FeedPost> {
  const response = await requestJson(
    `/api/posts/${postId}/likes`,
    { method: "POST" },
    postResponseSchema,
  );
  return response.data.post;
}

export async function unlikePost(postId: string): Promise<FeedPost> {
  const response = await requestJson(
    `/api/posts/${postId}/likes`,
    { method: "DELETE" },
    postResponseSchema,
  );
  return response.data.post;
}

export async function listPostLikers(
  postId: string,
  cursor?: string,
): Promise<PostLikersPage> {
  const query = new URLSearchParams({ limit: "20" });
  if (cursor) query.set("cursor", cursor);
  const response = await requestJson(
    `/api/posts/${postId}/likes?${query}`,
    { method: "GET" },
    postLikersResponseSchema,
  );
  return response.data;
}
