"use client";

import Image from "next/image";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Send,
  Video,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import type {
  CreatePostInput,
  PostVisibility,
} from "../../_lib/posts/post-contract";

type PostComposerProps = {
  onCreate: (input: CreatePostInput) => Promise<void>;
};

export function PostComposer({ onCreate }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canSubmit = content.trim().length > 0 && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setError("");
    setIsSubmitting(true);
    try {
      await onCreate({ content: trimmedContent, visibility });
      setContent("");
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
      <div className="mt-8 flex min-h-16 items-center bg-[#f5f8ff] px-6 dark:bg-[#11263c]">
        <div className="flex items-center gap-6 text-[#555b64] dark:text-white/46">
          <button type="button" disabled title="Image uploads are the next implementation slice" className="flex items-center gap-2 disabled:cursor-not-allowed">
            <ImageIcon className="size-5" />
            Photo
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <Video className="size-5" />
            Video
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <CalendarDays className="size-5" />
            Event
          </button>
          <button type="button" disabled className="flex items-center gap-2 disabled:cursor-not-allowed">
            <FileText className="size-5" />
            Article
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
            className="h-10 rounded border border-[#dce4f1] bg-white px-2 outline-none focus:border-[#1890ff] dark:border-white/15 dark:bg-[#112032]"
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
          {isSubmitting ? "Posting" : "Post"}
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
