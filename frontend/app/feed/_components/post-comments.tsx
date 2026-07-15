"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, SendHorizontal, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import {
  createComment,
  likeComment,
  listCommentLikers,
  listComments,
  listReplies,
  unlikeComment,
} from "../../_lib/comments/comment-client";
import type {
  CommentPage,
  FeedComment,
} from "../../_lib/comments/comment-contract";
import {
  DEFAULT_AVATAR,
  resolveAvatarUrl,
} from "../../_lib/uploads/media-url";
import { LikersDialog } from "./likers-dialog";

const FALLBACK_COMMENT_AVATAR = DEFAULT_AVATAR;

const postsQueryKey = ["posts"] as const;

function commentQueryKey(postId: string) {
  return ["posts", postId, "comments"] as const;
}

function replyQueryKey(commentId: string) {
  return ["comments", commentId, "replies"] as const;
}

function formatCommentTime(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

type CommentComposerProps = {
  label: string;
  placeholder?: string;
  isPending: boolean;
  onSubmit: (content: string) => Promise<void>;
  avatarUrl?: string;
};

function CommentComposer({
  label,
  placeholder = "Write a comment",
  isPending,
  onSubmit,
  avatarUrl = FALLBACK_COMMENT_AVATAR,
}: CommentComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    const value = content.trim();
    if (!value || isPending) return;
    setError("");
    try {
      await onSubmit(value);
      setContent("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to publish this comment",
      );
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex min-h-12 items-center rounded-[18px] bg-[#f6f6f6] px-[9px] py-1 dark:bg-[#182a41]"
      >
        <Image
          src={avatarUrl}
          alt=""
          width={26}
          height={26}
          className="size-[26px] shrink-0 rounded-full object-cover"
        />
        <textarea
          aria-label={label}
          placeholder={placeholder}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2_000}
          rows={1}
          className="h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-black/45 dark:text-white dark:placeholder:text-white/36"
        />
        <button
          type="submit"
          disabled={!content.trim() || isPending}
          aria-label="Publish comment"
          className="flex size-8 items-center justify-center rounded-full text-[#4d8dff] transition-colors hover:bg-[#e4f1fd] disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-[#123150]"
        >
          <SendHorizontal className="size-4" strokeWidth={1.6} />
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 px-2 text-xs text-[#d92d20]">
          {error}
        </p>
      )}
    </div>
  );
}

type CommentRowProps = {
  postId: string;
  comment: FeedComment;
  allowReply: boolean;
  refreshKey: readonly unknown[];
  currentUserAvatarUrl?: string;
};

function CommentRow({
  postId,
  comment,
  allowReply,
  refreshKey,
  currentUserAvatarUrl,
}: CommentRowProps) {
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [likeError, setLikeError] = useState("");
  const repliesQuery = useInfiniteQuery({
    queryKey: replyQueryKey(comment.id),
    queryFn: ({ pageParam }) => listReplies(comment.id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: allowReply && showReplies,
  });
  const likeMutation = useMutation({
    mutationFn: () =>
      comment.viewerHasLiked
        ? unlikeComment(comment.id)
        : likeComment(comment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: refreshKey }),
  });
  const replyMutation = useMutation({
    mutationFn: (content: string) =>
      createComment(postId, { content, parentId: comment.id }),
    onSuccess: async () => {
      setShowReplies(true);
      setIsReplying(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commentQueryKey(postId) }),
        queryClient.invalidateQueries({ queryKey: replyQueryKey(comment.id) }),
        queryClient.invalidateQueries({ queryKey: postsQueryKey }),
      ]);
    },
  });

  async function toggleLike() {
    setLikeError("");
    try {
      await likeMutation.mutateAsync();
    } catch (caughtError) {
      setLikeError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update this like",
      );
    }
  }

  const replies =
    repliesQuery.data?.pages.flatMap((page: CommentPage) => page.comments) ??
    [];

  return (
    <div className="flex gap-3">
      <Image
        src={resolveAvatarUrl(comment.author.avatarKey)}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full border border-black/10 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="relative w-fit max-w-full rounded-[18px] bg-[#f6f6f6] px-4 py-3 dark:bg-[#182a41]">
          <h3 className="pr-4 text-sm font-semibold leading-[18px] text-[#112032] dark:text-white">
            {comment.author.firstName} {comment.author.lastName}
          </h3>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-[18px] text-[#555b64] dark:text-white/60">
            {comment.content}
          </p>
          {comment.likeCount > 0 && (
            <button
              type="button"
              onClick={() => setShowLikers(true)}
              aria-label={`${comment.likeCount} comment likes`}
              className="absolute -bottom-3 right-0 flex items-center rounded-xl bg-white py-0.5 pl-3 pr-2 shadow-[0_8px_24px_rgba(149,157,165,0.2)] dark:bg-[#232e42]"
            >
              <span className="flex items-center">
                <ThumbsUp
                  className="size-4 text-[#4d8dff]"
                  strokeWidth={2}
                />
                {comment.likeCount > 1 && (
                  <Heart
                    className="-ml-1 size-4 text-red-500"
                    strokeWidth={2}
                  />
                )}
              </span>
              <span className="ml-1 mt-[3px] text-sm font-medium leading-[17px] text-[#112032] dark:text-white">
                {comment.likeCount}
              </span>
            </button>
          )}
        </div>

        <div className="ml-3 mt-2 flex items-center gap-1 text-xs font-medium text-[#555b64] dark:text-white/50">
          <button
            type="button"
            disabled={likeMutation.isPending}
            aria-pressed={comment.viewerHasLiked}
            onClick={toggleLike}
            className={comment.viewerHasLiked ? "text-[#1890ff]" : "hover:underline"}
          >
            {comment.viewerHasLiked ? "Liked" : "Like"}
          </button>
          {allowReply && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsReplying((current) => !current)}
                className="hover:underline"
              >
                Reply
              </button>
            </>
          )}
          <span>·</span>
          <time dateTime={comment.createdAt}>
            {formatCommentTime(comment.createdAt)}
          </time>
        </div>
        {likeError && (
          <p role="alert" className="ml-3 mt-1 text-xs text-[#d92d20]">
            {likeError}
          </p>
        )}

        {allowReply && comment.replyCount > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies((current) => !current)}
            className="ml-3 mt-3 text-xs font-semibold text-[#555b64] hover:underline dark:text-white/60"
          >
            {showReplies
              ? "Hide replies"
              : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
          </button>
        )}

        {isReplying && (
          <div className="mt-3">
            <CommentComposer
              label={`Reply to ${comment.author.firstName}`}
              placeholder={`Reply to ${comment.author.firstName}`}
              avatarUrl={currentUserAvatarUrl}
              isPending={replyMutation.isPending}
              onSubmit={(content) => replyMutation.mutateAsync(content).then(() => undefined)}
            />
          </div>
        )}

        {showReplies && (
          <div className="mt-4 space-y-4 border-l border-black/10 pl-4 dark:border-white/10">
            {repliesQuery.isPending && (
              <p className="text-xs text-[#8a8e98]">Loading replies...</p>
            )}
            {repliesQuery.isError && (
              <button
                type="button"
                onClick={() => repliesQuery.refetch()}
                className="text-xs text-[#1890ff]"
              >
                Unable to load replies. Try again
              </button>
            )}
            {replies.map((reply) => (
              <CommentRow
                key={reply.id}
                postId={postId}
                comment={reply}
                allowReply={false}
                refreshKey={replyQueryKey(comment.id)}
                currentUserAvatarUrl={currentUserAvatarUrl}
              />
            ))}
            {repliesQuery.hasNextPage && (
              <button
                type="button"
                disabled={repliesQuery.isFetchingNextPage}
                onClick={() => repliesQuery.fetchNextPage()}
                className="text-xs font-semibold text-[#1890ff] disabled:opacity-60"
              >
                {repliesQuery.isFetchingNextPage
                  ? "Loading..."
                  : "View more replies"}
              </button>
            )}
          </div>
        )}
      </div>

      <LikersDialog
        dialogId={`comment-${comment.id}-likers`}
        isOpen={showLikers}
        title="People who liked this comment"
        queryKey={["comments", comment.id, "likers"]}
        loadPage={(cursor) => listCommentLikers(comment.id, cursor)}
        onClose={() => setShowLikers(false)}
      />
    </div>
  );
}

export function PostComments({
  postId,
  currentUserAvatarUrl,
}: {
  postId: string;
  currentUserAvatarUrl?: string;
}) {
  const queryClient = useQueryClient();
  const commentsQuery = useInfiniteQuery({
    queryKey: commentQueryKey(postId),
    queryFn: ({ pageParam }) => listComments(postId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commentQueryKey(postId) }),
        queryClient.invalidateQueries({ queryKey: postsQueryKey }),
      ]);
    },
  });
  const comments =
    commentsQuery.data?.pages.flatMap(
      (page: CommentPage) => page.comments,
    ) ?? [];

  return (
    <section aria-label="Post comments" className="border-t border-black/5 dark:border-white/5">
      <div className="px-6 pb-3 pt-5">
        <CommentComposer
          label="Write a comment on this post"
          avatarUrl={currentUserAvatarUrl}
          isPending={createMutation.isPending}
          onSubmit={(content) => createMutation.mutateAsync(content).then(() => undefined)}
        />
      </div>

      <div className="space-y-5 px-6 pb-2 pt-3">
        {commentsQuery.isPending && (
          <p className="text-sm text-[#8a8e98]">Loading comments...</p>
        )}
        {commentsQuery.isError && (
          <button
            type="button"
            onClick={() => commentsQuery.refetch()}
            className="text-sm text-[#1890ff]"
          >
            Unable to load comments. Try again
          </button>
        )}
        {commentsQuery.isSuccess && comments.length === 0 && (
          <p className="text-sm text-[#8a8e98]">Be the first to comment.</p>
        )}
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            postId={postId}
            comment={comment}
            allowReply
            refreshKey={commentQueryKey(postId)}
            currentUserAvatarUrl={currentUserAvatarUrl}
          />
        ))}
        {commentsQuery.hasNextPage && (
          <button
            type="button"
            disabled={commentsQuery.isFetchingNextPage}
            onClick={() => commentsQuery.fetchNextPage()}
            className="text-sm font-semibold text-[#555b64] hover:underline disabled:opacity-60 dark:text-white/60"
          >
            {commentsQuery.isFetchingNextPage
              ? "Loading..."
              : "View previous comments"}
          </button>
        )}
      </div>
    </section>
  );
}
