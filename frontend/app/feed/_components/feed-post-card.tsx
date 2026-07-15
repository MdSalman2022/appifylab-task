"use client";

import { ImageIcon, Mic, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type {
  FeedPost,
  PostVisibility,
  UpdatePostInput,
} from "../../_lib/posts/post-contract";
import {
  DEFAULT_AVATAR,
  resolveAvatarUrl,
  resolveMediaUrl,
} from "../../_lib/uploads/media-url";
import { PostComments } from "./post-comments";
import { PostEngagement } from "./post-engagement";
import { VisibilitySelect, visibilityOptions } from "./visibility-select";

type FeedPostCardProps = {
  post: FeedPost;
  currentUserId: string;
  currentUserAvatarUrl?: string;
  onUpdate: (postId: string, input: UpdatePostInput) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onToggleLike: (postId: string, viewerHasLiked: boolean) => Promise<void>;
};

function PostVisibilityBadge({ visibility }: { visibility: PostVisibility }) {
  const { label, icon: Icon } = visibilityOptions[visibility];
  return (
    <span className="inline-flex items-center gap-1">
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
      {label}
    </span>
  );
}

function formatPostTime(value: string) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function FeedPostCard({
  post,
  currentUserId,
  currentUserAvatarUrl,
  onUpdate,
  onDelete,
  onToggleLike,
}: FeedPostCardProps) {
  const isAuthor = post.authorId === currentUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [areCommentsOpen, setAreCommentsOpen] = useState(false);
  const [content, setContent] = useState(post.content ?? "");
  const [visibility, setVisibility] = useState<PostVisibility>(post.visibility);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const postImageUrl = resolveMediaUrl(post.imageKey);

  async function savePost() {
    const trimmedContent = content.trim();
    if (!trimmedContent && !post.imageKey) return;
    setError("");
    setIsSaving(true);
    try {
      await onUpdate(post.id, { content: trimmedContent, visibility });
      setIsEditing(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update post",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function removePost() {
    if (!window.confirm("Delete this post?")) return;
    setError("");
    try {
      await onDelete(post.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete post",
      );
    }
  }

  return (
    <article className="_feed_inner_area mt-4 overflow-hidden rounded-md bg-white pb-6 dark:bg-[#112032] dark:text-white">
      <div className="px-6 pt-6">
        <header className="relative flex items-center">
          <Image
            src={resolveAvatarUrl(post.author.avatarKey)}
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
          <div className="ml-3">
            <h2 className="font-medium">
              {post.author.firstName} {post.author.lastName}
            </h2>
            <p className="flex items-center gap-1 text-sm text-[#8a8e98] dark:text-white/46">
              {formatPostTime(post.createdAt)} ·{" "}
              <PostVisibilityBadge visibility={post.visibility} />
            </p>
          </div>
          {isAuthor && (
            <button
              type="button"
              aria-label="Post options"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
              className="ml-auto"
            >
              <MoreVertical className="size-5 text-[#aaa] dark:text-white/46" />
            </button>
          )}
          {isAuthor && isMenuOpen && (
            <div className="absolute right-0 top-9 z-10 w-32 rounded border border-black/10 bg-white p-1 text-sm shadow-lg dark:border-white/10 dark:bg-[#112032]">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setIsMenuOpen(false);
                }}
                className="block w-full rounded px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={removePost}
                className="block w-full rounded px-3 py-2 text-left text-[#d92d20] hover:bg-black/5 dark:hover:bg-white/10"
              >
                Delete
              </button>
            </div>
          )}
        </header>

        {isEditing ? (
          <div className="my-4 space-y-3">
            <textarea
              aria-label="Edit post content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={5_000}
              rows={3}
              className="w-full resize-none rounded border border-[#dce4f1] bg-transparent p-3 outline-none focus:border-[#1890ff] dark:border-white/15"
            />
            <div className="flex items-center justify-end gap-2">
              <VisibilitySelect
                value={visibility}
                onChange={setVisibility}
                disabled={isSaving}
                direction="down"
              />
              <button
                type="button"
                onClick={() => {
                  setContent(post.content ?? "");
                  setVisibility(post.visibility);
                  setIsEditing(false);
                }}
                className="rounded border border-[#dce4f1] px-4 py-2 dark:border-white/15"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePost}
                disabled={isSaving}
                className="rounded bg-[#1890ff] px-4 py-2 text-white disabled:opacity-60"
              >
                {isSaving ? "Saving" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          post.content && (
            <p className="my-4 whitespace-pre-wrap text-sm">{post.content}</p>
          )
        )}

        {postImageUrl && (
          <Image
            src={postImageUrl}
            alt="Post attachment"
            width={588}
            height={430}
            className="mb-6 h-auto w-full rounded-md object-cover"
          />
        )}
        {error && (
          <p role="alert" className="mb-3 text-sm text-[#d92d20]">
            {error}
          </p>
        )}
      </div>
      <PostEngagement
        postId={post.id}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        viewerHasLiked={post.viewerHasLiked}
        commentsOpen={areCommentsOpen}
        onToggleLike={() => onToggleLike(post.id, post.viewerHasLiked)}
        onOpenComments={() => setAreCommentsOpen((current) => !current)}
      />
      {!areCommentsOpen && (
        <div className="px-6 pb-1 pt-5">
          <button
            type="button"
            onClick={() => setAreCommentsOpen(true)}
            className="flex min-h-12 w-full items-center rounded-[18px] bg-[#f6f6f6] px-[9px] py-1 text-left dark:bg-[#182a41]"
          >
            <Image
              src={currentUserAvatarUrl ?? DEFAULT_AVATAR}
              alt=""
              width={26}
              height={26}
              className="size-[26px] shrink-0 rounded-full object-cover"
            />
            <span className="min-w-0 flex-1 px-2 text-sm text-black/45 dark:text-white/36">
              Write a comment
            </span>
            <Mic
              aria-hidden="true"
              className="mx-2 size-4 text-black/45 dark:text-white/46"
              strokeWidth={1.5}
            />
            <ImageIcon
              aria-hidden="true"
              className="mr-2 size-4 text-black/45 dark:text-white/46"
              strokeWidth={1.5}
            />
          </button>
        </div>
      )}
      {areCommentsOpen && (
        <PostComments
          postId={post.id}
          currentUserAvatarUrl={currentUserAvatarUrl}
        />
      )}
    </article>
  );
}
