export const POST_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type PostImageContentType = (typeof POST_IMAGE_CONTENT_TYPES)[number];

export type PostImageUpload = {
  key: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: { "Content-Type": PostImageContentType };
};

export type PostImageStorage = {
  createPostImageUpload(input: {
    userId: string;
    fileName: string;
    contentType: PostImageContentType;
    size: number;
  }): Promise<PostImageUpload>;
};
