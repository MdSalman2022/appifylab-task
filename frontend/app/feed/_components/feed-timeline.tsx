"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createPost,
  deletePost,
  likePost,
  listPosts,
  unlikePost,
  updatePost,
} from "../../_lib/posts/post-client";
import type {
  CreatePostInput,
  PostPage,
  UpdatePostInput,
} from "../../_lib/posts/post-contract";
import { FeedPostCard } from "./feed-post-card";
import { PostComposer } from "./post-composer";

const postsQueryKey = ["posts"] as const;

export function FeedTimeline({ currentUserId }: { currentUserId: string }) {
  const queryClient = useQueryClient();
  const postsQuery = useInfiniteQuery({
    queryKey: postsQueryKey,
    queryFn: ({ pageParam }) => listPosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ postId, input }: { postId: string; input: UpdatePostInput }) =>
      updatePost(postId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
  });
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
  });
  const likeMutation = useMutation({
    mutationFn: ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) =>
      hasLiked ? unlikePost(postId) : likePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
  });

  const posts = postsQuery.data?.pages.flatMap((page: PostPage) => page.posts) ?? [];

  async function handleCreate(input: CreatePostInput) {
    await createMutation.mutateAsync(input);
  }

  return (
    <>
      <PostComposer onCreate={handleCreate} />
      {postsQuery.isPending && (
        <div aria-label="Loading posts" className="mt-4 h-64 animate-pulse rounded-md bg-white dark:bg-[#112032]" />
      )}
      {postsQuery.isError && (
        <section className="mt-4 rounded-md bg-white p-6 text-center dark:bg-[#112032] dark:text-white">
          <p>Unable to load posts.</p>
          <button type="button" onClick={() => postsQuery.refetch()} className="mt-3 rounded bg-[#1890ff] px-4 py-2 text-sm text-white">Try again</button>
        </section>
      )}
      {postsQuery.isSuccess && posts.length === 0 && (
        <section className="mt-4 rounded-md bg-white p-8 text-center text-[#595b61] dark:bg-[#112032] dark:text-white/70">
          <h2 className="font-medium text-[#112032] dark:text-white">No posts yet</h2>
          <p className="mt-1 text-sm">Create the first post for your community.</p>
        </section>
      )}
      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onUpdate={(postId, input) => updateMutation.mutateAsync({ postId, input }).then(() => undefined)}
          onDelete={(postId) => deleteMutation.mutateAsync(postId).then(() => undefined)}
          onToggleLike={(postId, hasLiked) =>
            likeMutation
              .mutateAsync({ postId, hasLiked })
              .then(() => undefined)
          }
        />
      ))}
      {postsQuery.hasNextPage && (
        <button type="button" disabled={postsQuery.isFetchingNextPage} onClick={() => postsQuery.fetchNextPage()} className="mt-4 h-12 w-full rounded-md bg-white text-sm text-[#1890ff] disabled:opacity-60 dark:bg-[#112032]">
          {postsQuery.isFetchingNextPage ? "Loading..." : "Load more posts"}
        </button>
      )}
    </>
  );
}
