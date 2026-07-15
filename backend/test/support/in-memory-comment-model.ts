import type { AuthModel } from "../../src/models/auth-model.js";
import type {
  CommentModel,
  StoredComment,
} from "../../src/models/comment-model.js";

export function createInMemoryCommentModel(authModel: AuthModel): CommentModel {
  const comments: StoredComment[] = [];
  const likes: { commentId: string; userId: string; createdAt: Date }[] = [];
  let timestamp = Date.now();

  function likedBy(commentId: string, userId: string) {
    return likes.some(
      (like) => like.commentId === commentId && like.userId === userId,
    );
  }

  async function getAuthor(authorId: string) {
    const user = await authModel.findUserById(authorId);
    if (!user) throw new Error("Author not found");
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarKey: null,
    };
  }

  function withViewer(comment: StoredComment, viewerId: string) {
    return {
      ...comment,
      viewerHasLiked: likedBy(comment.id, viewerId),
    };
  }

  return {
    async createComment(input) {
      const comment: StoredComment = {
        ...input,
        id: crypto.randomUUID(),
        likeCount: 0,
        replyCount: 0,
        viewerHasLiked: false,
        createdAt: new Date(++timestamp),
        author: await getAuthor(input.authorId),
      };
      comments.push(comment);
      if (input.parentId) {
        const parent = comments.find(({ id }) => id === input.parentId);
        if (parent) parent.replyCount += 1;
      }
      return comment;
    },
    async listComments({ postId, parentId, viewerId, cursor, limit }) {
      const matching = comments.filter(
        (comment) =>
          comment.postId === postId && comment.parentId === parentId,
      );
      const start = cursor
        ? Math.max(matching.findIndex(({ id }) => id === cursor) + 1, 0)
        : 0;
      return matching
        .slice(start, start + limit)
        .map((comment) => withViewer(comment, viewerId));
    },
    async findCommentById(id, viewerId) {
      const comment = comments.find((candidate) => candidate.id === id);
      return comment ? withViewer(comment, viewerId) : null;
    },
    async likeComment(commentId, userId) {
      const comment = comments.find(({ id }) => id === commentId);
      if (!comment) throw new Error("Comment not found");
      if (!likedBy(commentId, userId)) {
        likes.unshift({ commentId, userId, createdAt: new Date(++timestamp) });
        comment.likeCount += 1;
      }
      return withViewer(comment, userId);
    },
    async unlikeComment(commentId, userId) {
      const comment = comments.find(({ id }) => id === commentId);
      if (!comment) throw new Error("Comment not found");
      const index = likes.findIndex(
        (like) => like.commentId === commentId && like.userId === userId,
      );
      if (index >= 0) {
        likes.splice(index, 1);
        comment.likeCount -= 1;
      }
      return withViewer(comment, userId);
    },
    async listCommentLikers({ commentId, cursor, limit }) {
      const commentLikes = likes.filter(
        (like) => like.commentId === commentId,
      );
      const start = cursor
        ? Math.max(
            commentLikes.findIndex(({ userId }) => userId === cursor) + 1,
            0,
          )
        : 0;
      return Promise.all(
        commentLikes
          .slice(start, start + limit)
          .map(({ userId }) => getAuthor(userId)),
      );
    },
  };
}
