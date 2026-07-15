"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

import type {
  PostLiker,
  PostLikersPage,
} from "../../_lib/posts/post-contract";
import { resolveAvatarUrl } from "../../_lib/uploads/media-url";

type LikersDialogProps = {
  dialogId: string;
  isOpen: boolean;
  title: string;
  queryKey: readonly unknown[];
  loadPage: (cursor?: string) => Promise<PostLikersPage>;
  onClose: () => void;
};

function UserRow({ user }: { user: PostLiker }) {
  return (
    <li className="flex items-center gap-3">
      <Image
        src={resolveAvatarUrl(user.avatarKey)}
        alt=""
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"
      />
      <span className="text-sm font-medium">
        {user.firstName} {user.lastName}
      </span>
    </li>
  );
}

export function LikersDialog({
  dialogId,
  isOpen,
  title,
  queryKey,
  loadPage,
  onClose,
}: LikersDialogProps) {
  const likersQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => loadPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const users = likersQuery.data?.pages.flatMap((page) => page.users) ?? [];
  const titleId = `${dialogId}-title`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[70vh] w-full max-w-sm overflow-hidden rounded-md bg-white shadow-xl dark:bg-[#112032] dark:text-white"
      >
        <header className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
          <h2 id={titleId} className="font-medium">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close likers">
            <X className="size-5" />
          </button>
        </header>

        <div className="max-h-[55vh] overflow-y-auto p-5">
          {likersQuery.isPending && (
            <p className="text-sm text-[#8a8e98]">Loading...</p>
          )}
          {likersQuery.isError && (
            <div className="text-sm">
              <p>Unable to load likes.</p>
              <button
                type="button"
                onClick={() => likersQuery.refetch()}
                className="mt-2 text-[#1890ff]"
              >
                Try again
              </button>
            </div>
          )}
          {likersQuery.isSuccess && users.length === 0 && (
            <p className="text-sm text-[#8a8e98]">No likes yet.</p>
          )}
          <ul className="space-y-4">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </ul>
          {likersQuery.hasNextPage && (
            <button
              type="button"
              disabled={likersQuery.isFetchingNextPage}
              onClick={() => likersQuery.fetchNextPage()}
              className="mt-5 w-full rounded border border-[#dce4f1] py-2 text-sm text-[#1890ff] disabled:opacity-60 dark:border-white/15"
            >
              {likersQuery.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
