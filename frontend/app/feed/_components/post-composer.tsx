"use client";

import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Send,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  CreatePostInput,
  PostVisibility,
} from "../../_lib/posts/post-contract";
import {
  uploadPostImage,
  validatePostImage,
} from "../../_lib/uploads/upload-client";

type PostComposerProps = {
  onCreate: (input: CreatePostInput) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
};

export function PostComposer({
  onCreate,
  onUploadImage = uploadPostImage,
}: PostComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => {
    if (!selectedImage || typeof URL.createObjectURL !== "function") {
      return null;
    }
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);
  const canSubmit =
    (content.trim().length > 0 || selectedImage !== null) && !isSubmitting;

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    try {
      validatePostImage(file);
      setSelectedImage(file);
    } catch (caughtError) {
      setSelectedImage(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Choose a valid image",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent && !selectedImage) return;

    setError("");
    setIsSubmitting(true);
    try {
      const imageKey = selectedImage
        ? await onUploadImage(selectedImage)
        : undefined;
      await onCreate({
        ...(trimmedContent ? { content: trimmedContent } : {}),
        ...(imageKey ? { imageKey } : {}),
        visibility,
      });
      setContent("");
      setSelectedImage(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create your post",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="_feed_inner_area mt-4 rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white"
    >
      <div className="flex items-start gap-3">
        <Image
          src="/assets/images/txt_img.png"
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
        />
        <textarea
          aria-label="Post content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5_000}
          rows={2}
          placeholder="Write something ..."
          className="min-h-16 flex-1 resize-none bg-transparent pt-1 text-base text-[#595b61] outline-none placeholder:text-[#595b61] dark:text-white dark:placeholder:text-white/46"
        />
      </div>

      {selectedImage && (
        <div className="relative mt-4 overflow-hidden rounded-md border border-[#dce4f1] bg-[#f5f8ff] dark:border-white/10 dark:bg-[#11263c]">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Selected post image preview"
              width={588}
              height={320}
              unoptimized
              className="max-h-80 w-full object-contain"
            />
          ) : (
            <p className="p-4 text-sm">{selectedImage.name}</p>
          )}
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Remove selected image"
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-8 flex min-h-16 items-center bg-[#f5f8ff] px-6 dark:bg-[#11263c]">
        <div className="flex items-center gap-6 text-[#555b64] dark:text-white/46">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose a post image"
            onChange={selectImage}
            className="sr-only"
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 disabled:cursor-not-allowed"
          >
            <ImageIcon className="size-5" />
            Photo
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <Video className="size-5" /> Video
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <CalendarDays className="size-5" /> Event
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <FileText className="size-5" /> Article
          </button>
        </div>
        <label className="ml-auto mr-3 text-sm text-[#555b64] dark:text-white/70">
          <span className="sr-only">Post visibility</span>
          <select
            aria-label="Post visibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as PostVisibility)
            }
            disabled={isSubmitting}
            className="h-10 rounded border border-[#dce4f1] bg-white px-2 outline-none focus:border-[#1890ff] disabled:opacity-60 dark:border-white/15 dark:bg-[#112032]"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-12 w-[102px] items-center justify-center gap-2 rounded bg-[#1890ff] font-medium text-white transition-colors hover:bg-[#377dff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="size-4" />
          {isSubmitting ? (selectedImage ? "Uploading" : "Posting") : "Post"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#d92d20]">
          {error}
        </p>
      )}
    </form>
  );
}
