import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import type { AuthUser } from "../../_lib/auth/auth-contract";
import { HeaderActions } from "./header-actions";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ProfileMenu } from "./profile-menu";

export function FeedHeader({ user }: { user: AuthUser }) {
  return (
    <>
      <header className="_feed_header fixed inset-x-0 top-0 z-50 h-14 border-t-2 border-[#263a30] bg-white lg:h-[74px] dark:bg-[#112032] dark:text-white">
        {/* Desktop header */}
        <div className="!mx-auto hidden h-[74px] w-full max-w-[1320px] items-center px-3 lg:flex">
          <Link
            href="/feed"
            className="w-[169px] shrink-0"
            aria-label="BuddyScript home"
          >
            <Image
              src="/assets/images/logo.svg"
              alt="BuddyScript"
              width={137}
              height={28}
              className="h-auto w-[137px]"
            />
          </Link>
          <form className="relative ml-[112px] w-full max-w-[424px] shrink">
            <Search
              aria-hidden="true"
              className="absolute left-[18px] top-1/2 size-[17px] -translate-y-1/2 text-[#666] dark:text-[#1890ff]"
            />
            <input
              aria-label="Search"
              type="search"
              placeholder="input search text"
              className="h-10 w-full rounded-full border-0 bg-[#f5f5f5] py-2 pl-12 pr-4 text-base outline-none dark:bg-[#232e42] dark:text-white dark:placeholder:text-[#8c8f95]"
            />
          </form>
          <HeaderActions />
          <ProfileMenu user={user} />
        </div>

        {/* Mobile header */}
        <div className="!mx-auto flex h-14 w-full items-center justify-between px-4 lg:hidden">
          <Link href="/feed" aria-label="BuddyScript home">
            <Image
              src="/assets/images/logo.svg"
              alt="BuddyScript"
              width={120}
              height={25}
              className="h-auto w-[120px]"
            />
          </Link>
          <button
            type="button"
            aria-label="Search"
            className="flex size-9 items-center justify-center text-[#666] dark:text-white/70"
          >
            <Search className="size-[19px]" strokeWidth={1.8} />
          </button>
        </div>
      </header>
      <MobileBottomNav user={user} />
    </>
  );
}
