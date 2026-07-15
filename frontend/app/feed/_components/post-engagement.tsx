"use client";

import { Forward, MessageSquareText, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { PostLikersDialog } from "./post-likers-dialog";

type PostEngagementProps = {
  postId: string;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  onToggleLike: () => Promise<void>;
  onOpenComments: () => void;
};

export function PostEngagement({
  postId,
  likeCount,
  commentCount,
  viewerHasLiked,
  onToggleLike,
  onOpenComments,
}: PostEngagementProps) {
  const [isLikePending, setIsLikePending] = useState(false);
  const [isLikersOpen, setIsLikersOpen] = useState(false);
  const [likeError, setLikeError] = useState("");

  async function toggleLike() {
    setLikeError("");
    setIsLikePending(true);
    try {
      await onToggleLike();
    } catch (error) {
      setLikeError(
        error instanceof Error ? error.message : "Unable to update this like",
      );
    } finally {
      setIsLikePending(false);
    }
  }

  return (
    <>
      <div className="mb-[26px] flex min-h-8 items-center justify-between px-6">
        <button
          type="button"
          disabled={likeCount === 0}
          onClick={() => setIsLikersOpen(true)}
          className="flex items-center gap-2 text-sm text-[#1890ff] disabled:cursor-default disabled:text-transparent"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#4d8dff] text-white">
            <ThumbsUp className="size-4" fill="currentColor" />
          </span>
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </button>
        <div className="flex gap-4 text-sm text-black/45 dark:text-white/46">
          <button type="button" onClick={onOpenComments}>
            <span className="text-[#112032] dark:text-white">{commentCount}</span>{" "}
            {commentCount === 1 ? "Comment" : "Comments"}
          </button>
          <span>Share</span>
        </div>
      </div>

      <div className="flex bg-[#fbfcfd] p-2 dark:bg-[#11263c]">
        <button
          type="button"
          disabled={isLikePending}
          aria-pressed={viewerHasLiked}
          onClick={toggleLike}
          className={`mr-1 flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors disabled:opacity-60 ${
            viewerHasLiked
              ? "bg-[#e4f1fd] text-[#1890ff] dark:bg-[#123150]"
              : "hover:bg-[#e4f1fd] dark:hover:bg-[#123150]"
          }`}
        >
          <ThumbsUp
            className="size-[19px]"
            fill={viewerHasLiked ? "currentColor" : "none"}
          />
          Like
        </button>
        <button
          type="button"
          onClick={onOpenComments}
          className="mr-1 flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors hover:bg-[#e4f1fd] dark:hover:bg-[#123150]"
        >
          <MessageSquareText className="size-[21px]" strokeWidth={1.3} />
          Comment
        </button>
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors hover:bg-[#e4f1fd] dark:hover:bg-[#123150]"
        >
          <Forward className="size-6" strokeWidth={1.3} />
          Share
        </button>
      </div>
      {likeError && (
        <p role="alert" className="px-6 pt-3 text-sm text-[#d92d20]">
          {likeError}
        </p>
      )}

      <PostLikersDialog
        postId={postId}
        isOpen={isLikersOpen}
        onClose={() => setIsLikersOpen(false)}
      />
    </>
  );
}
