"use client";

import { listPostLikers } from "../../_lib/posts/post-client";
import { LikersDialog } from "./likers-dialog";

type PostLikersDialogProps = {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function PostLikersDialog({
  postId,
  isOpen,
  onClose,
}: PostLikersDialogProps) {
  return (
    <LikersDialog
      dialogId={`post-${postId}-likers`}
      isOpen={isOpen}
      title="People who liked this post"
      queryKey={["posts", postId, "likers"]}
      loadPage={(cursor) => listPostLikers(postId, cursor)}
      onClose={onClose}
    />
  );
}
