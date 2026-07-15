"use client";

import { Forward, MessageSquareText, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { PostLikersDialog } from "./post-likers-dialog";

const reactionPreviewAvatars = [
  "/assets/images/react_img1.png",
  "/assets/images/react_img2.png",
  "/assets/images/react_img3.png",
  "/assets/images/react_img4.png",
  "/assets/images/react_img5.png",
] as const;

type PostEngagementProps = {
  postId: string;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  commentsOpen: boolean;
  onToggleLike: () => Promise<void>;
  onOpenComments: () => void;
};

export function PostEngagement({
  postId,
  likeCount,
  commentCount,
  viewerHasLiked,
  commentsOpen,
  onToggleLike,
  onOpenComments,
}: PostEngagementProps) {
  const [isLikePending, setIsLikePending] = useState(false);
  const [isLikersOpen, setIsLikersOpen] = useState(false);
  const [likeError, setLikeError] = useState("");
  const reactionPreviewCount = Math.min(
    likeCount,
    reactionPreviewAvatars.length,
  );

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
          aria-label={
            likeCount === 0
              ? "No likes yet"
              : `View ${likeCount} ${likeCount === 1 ? "person" : "people"} who liked this post`
          }
          className="flex min-h-8 items-center text-sm disabled:cursor-default"
        >
          {Array.from({ length: reactionPreviewCount }, (_, index) => (
            <Image
              key={index}
              src={reactionPreviewAvatars[index]}
              alt=""
              width={32}
              height={32}
              className={`${index === 0 ? "ml-0" : "-ml-4"} size-8 rounded-full border border-white object-cover dark:border-[#112032]`}
            />
          ))}
          {likeCount > reactionPreviewCount && (
            <span className="-ml-4 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#4d8dff] text-xs text-white dark:border-[#112032]">
              {likeCount - reactionPreviewCount}+
            </span>
          )}
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
          aria-expanded={commentsOpen}
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
