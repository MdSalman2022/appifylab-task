"use client";

import { Search, UserRoundPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  DEFAULT_AVATAR,
  resolveAvatarUrl,
} from "../../_lib/uploads/media-url";
import type { CommunityUser } from "../../_lib/users/user-contract";
import { EmptyState } from "./empty-state";
import { communityRole, useCommunityUsers } from "./use-community-users";

const FALLBACK_AVATAR = DEFAULT_AVATAR;

function fullName(user: CommunityUser) {
  return `${user.firstName} ${user.lastName}`;
}

function PeopleSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-label="Loading people" className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3">
          <div className="size-10 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-28 rounded bg-black/10 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function SuggestedPeople() {
  const usersQuery = useCommunityUsers();

  return (
    <section className="_feed_inner_area rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-medium">Suggested People</h2>
        <Link href="/feed/explore/find-friends" className="text-xs text-[#4d72ff]">
          See All
        </Link>
      </div>
      {usersQuery.isPending && <PeopleSkeleton rows={3} />}
      {usersQuery.isError && (
        <p className="text-sm text-[#8a8e98]">Unable to load people.</p>
      )}
      {usersQuery.isSuccess && usersQuery.data.length === 0 && (
        <EmptyState
          size="sm"
          icon={UserRoundPlus}
          title="No suggestions yet"
          description="People you may know will show up here as your community grows."
        />
      )}
      <div className="space-y-4">
        {(usersQuery.data ?? []).slice(0, 3).map((user) => (
          <div key={user.id} className="flex items-center">
            <Image
              src={resolveAvatarUrl(user.avatarKey, FALLBACK_AVATAR)}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium dark:text-white">
                {fullName(user)}
              </p>
              <p className="text-[11px] dark:text-white">
                {communityRole(fullName(user))}
              </p>
            </div>
            <Link
              href="/feed/friends"
              className="ml-auto flex h-8 items-center rounded-sm border border-[#dcdfe4] px-[7px] text-xs font-medium text-[#959eae] transition-colors hover:border-[#1890ff] hover:bg-[#1890ff] hover:text-[#f3f9ff] dark:border-[#1890ff] dark:bg-transparent dark:text-white dark:hover:bg-[#1890ff]"
            >
              Connect
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function YouMightLike() {
  const usersQuery = useCommunityUsers();
  const user = usersQuery.data?.at(-1);

  return (
    <section className="_feed_inner_area rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
      <div className="mb-6 flex items-center justify-between border-b border-[#eee] pb-5 dark:border-white/20">
        <h2 className="text-xl font-medium">You Might Like</h2>
        <Link href="/feed/explore/find-friends" className="text-xs text-[#4d72ff]">
          See All
        </Link>
      </div>
      {usersQuery.isPending && <PeopleSkeleton rows={1} />}
      {usersQuery.isError && (
        <p className="text-sm text-[#8a8e98]">Unable to load people.</p>
      )}
      {usersQuery.isSuccess && !user && (
        <EmptyState
          size="sm"
          icon={UserRoundPlus}
          title="No recommendations yet"
          description="Accounts you might want to follow will show up here."
        />
      )}
      {user && (
        <>
          <div className="flex items-center gap-4">
            <Image
              src={resolveAvatarUrl(user.avatarKey, FALLBACK_AVATAR)}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium dark:text-white">{fullName(user)}</p>
              <p className="text-xs text-[#74787f] dark:text-white">
                {communityRole(fullName(user))}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Link
              href="/feed"
              className="flex h-10 items-center justify-center rounded border border-[#f1f1f1] text-sm font-medium text-[#959eae] transition-colors hover:bg-[#377dff] hover:text-white dark:border-[#1890ff] dark:text-white dark:hover:border-[#1890ff] dark:hover:bg-[#1890ff]"
            >
              Ignore
            </Link>
            <Link
              href="/feed/friends"
              className="flex h-10 items-center justify-center rounded bg-[#377dff] font-medium text-white transition-colors hover:bg-[#1890ff]"
            >
              Follow
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export function FriendsList() {
  const usersQuery = useCommunityUsers();

  return (
    <section className="_feed_inner_area rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-medium">Your Friends</h2>
        <Link href="/feed/friends" className="text-xs text-[#4d72ff]">
          See All
        </Link>
      </div>
      <label className="relative mb-6 block">
        <span className="sr-only">Search friends</span>
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#777] dark:text-[#1890ff]" />
        <input
          type="search"
          aria-label="Search friends"
          placeholder="input search text"
          className="h-10 w-full rounded-full border-0 bg-[#f5f5f5] pl-11 pr-4 text-base outline-none placeholder:text-[#b2b2b2] dark:bg-[#232e42] dark:text-white dark:placeholder:text-[#8c8f95]"
        />
      </label>
      {usersQuery.isPending && <PeopleSkeleton rows={4} />}
      {usersQuery.isError && (
        <p className="text-sm text-[#8a8e98]">Unable to load people.</p>
      )}
      {usersQuery.isSuccess && usersQuery.data.length === 0 && (
        <EmptyState
          size="sm"
          icon={Users}
          title="No friends yet"
          description="Once you connect with people, your friends will show up here."
        />
      )}
      <div className="space-y-[25px]">
        {(usersQuery.data ?? []).map((user) => (
          <div key={user.id} className="flex items-center">
            <Image
              src={resolveAvatarUrl(user.avatarKey, FALLBACK_AVATAR)}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <p className="text-sm font-medium dark:text-white">
                {fullName(user)}
              </p>
              <p className="text-[11px] dark:text-white">
                {communityRole(fullName(user))}
              </p>
            </div>
            <span className="ml-auto size-[10px] rounded-full bg-[#4ac97b]" />
          </div>
        ))}
      </div>
    </section>
  );
}
