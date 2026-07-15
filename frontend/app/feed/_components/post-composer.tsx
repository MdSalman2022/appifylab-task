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
import { DEFAULT_AVATAR } from "../../_lib/uploads/media-url";
import {
  uploadPostImage,
  validatePostImage,
} from "../../_lib/uploads/upload-client";
import { VisibilitySelect } from "./visibility-select";

type PostComposerProps = {
  onCreate: (input: CreatePostInput) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
  avatarUrl?: string;
};

export function PostComposer({
  onCreate,
  onUploadImage = uploadPostImage,
  avatarUrl = DEFAULT_AVATAR,
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
          src={avatarUrl}
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
        <VisibilitySelect
          value={visibility}
          onChange={setVisibility}
          disabled={isSubmitting}
          direction="down"
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

      <div className="mt-8 flex min-h-16 items-center gap-2 bg-[#f5f8ff] px-3 sm:px-6 dark:bg-[#11263c]">
        <div className="flex items-center gap-4 text-[#555b64] sm:gap-6 dark:text-white/46">
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
            <span className="max-sm:hidden">Photo</span>
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <Video className="size-5" /> <span className="max-sm:hidden">Video</span>
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <CalendarDays className="size-5" /> <span className="max-sm:hidden">Event</span>
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <FileText className="size-5" /> <span className="max-sm:hidden">Article</span>
          </button>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="ml-auto flex h-12 min-w-24 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded bg-[#1890ff] px-4 font-medium text-white transition-colors hover:bg-[#377dff] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[102px]"
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
