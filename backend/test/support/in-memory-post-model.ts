import type { AuthModel } from "../../src/models/auth-model.js";
import type {
  PostModel,
  StoredPost,
} from "../../src/models/post-model.js";

export function createInMemoryPostModel(authModel: AuthModel): PostModel {
  const posts: StoredPost[] = [];
  const likes: { postId: string; userId: string; createdAt: Date }[] = [];
  let timestamp = Date.now();

  function likedBy(postId: string, userId: string) {
    return likes.some(
      (like) => like.postId === postId && like.userId === userId,
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

  return {
    async createPost(input) {
      const createdAt = new Date(++timestamp);
      const post: StoredPost = {
        ...input,
        id: crypto.randomUUID(),
        likeCount: 0,
        commentCount: 0,
        viewerHasLiked: false,
        createdAt,
        updatedAt: createdAt,
        author: await getAuthor(input.authorId),
      };
      posts.unshift(post);
      return post;
    },
    async listVisiblePosts({ viewerId, cursor, limit }) {
      const visible = posts.filter(
        (post) => post.visibility === "PUBLIC" || post.authorId === viewerId,
      );
      const start = cursor
        ? Math.max(visible.findIndex((post) => post.id === cursor) + 1, 0)
        : 0;
      return visible.slice(start, start + limit).map((post) => ({
        ...post,
        viewerHasLiked: likedBy(post.id, viewerId),
      }));
    },
    async findPostById(id, viewerId) {
      const post = posts.find((candidate) => candidate.id === id);
      return post
        ? { ...post, viewerHasLiked: likedBy(post.id, viewerId) }
        : null;
    },
    async updatePost(id, input, viewerId) {
      const post = posts.find((candidate) => candidate.id === id);
      if (!post) throw new Error("Post not found");
      Object.assign(post, input, { updatedAt: new Date(++timestamp) });
      return { ...post, viewerHasLiked: likedBy(post.id, viewerId) };
    },
    async deletePost(id) {
      const index = posts.findIndex((post) => post.id === id);
      if (index >= 0) posts.splice(index, 1);
      for (let likeIndex = likes.length - 1; likeIndex >= 0; likeIndex -= 1) {
        if (likes[likeIndex].postId === id) likes.splice(likeIndex, 1);
      }
    },
    async likePost(postId, userId) {
      const post = posts.find((candidate) => candidate.id === postId);
      if (!post) throw new Error("Post not found");
      if (!likedBy(postId, userId)) {
        likes.unshift({ postId, userId, createdAt: new Date(++timestamp) });
        post.likeCount += 1;
      }
      return { ...post, viewerHasLiked: true };
    },
    async unlikePost(postId, userId) {
      const post = posts.find((candidate) => candidate.id === postId);
      if (!post) throw new Error("Post not found");
      const index = likes.findIndex(
        (like) => like.postId === postId && like.userId === userId,
      );
      if (index >= 0) {
        likes.splice(index, 1);
        post.likeCount -= 1;
      }
      return { ...post, viewerHasLiked: false };
    },
    async listPostLikers({ postId, cursor, limit }) {
      const postLikes = likes.filter((like) => like.postId === postId);
      const start = cursor
        ? Math.max(
            postLikes.findIndex((like) => like.userId === cursor) + 1,
            0,
          )
        : 0;
      return Promise.all(
        postLikes
          .slice(start, start + limit)
          .map(({ userId }) => getAuthor(userId)),
      );
    },
  };
}
