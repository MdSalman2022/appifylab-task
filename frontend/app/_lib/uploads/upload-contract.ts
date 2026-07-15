import { z } from "zod";

export const postImageUploadResponseSchema = z.object({
  data: z.object({
    upload: z.object({
      key: z.string().min(1),
      uploadUrl: z.url(),
      expiresAt: z.iso.datetime(),
      requiredHeaders: z.object({
        "Content-Type": z.enum(["image/jpeg", "image/png", "image/webp"]),
      }),
    }),
  }),
});

export type PostImageUpload = z.infer<
  typeof postImageUploadResponseSchema
>["data"]["upload"];
