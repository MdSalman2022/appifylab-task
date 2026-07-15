"use client";

import {
  Bell,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, logout } from "../../_lib/auth/auth-client";
import type { AuthUser } from "../../_lib/auth/auth-contract";
import { resolveAvatarUrl } from "../../_lib/uploads/media-url";
import { toggleTheme } from "./feed-theme";

const links = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/feed/friends", label: "Friends", icon: Users },
  { href: "/feed/notifications", label: "Notifications", icon: Bell },
  { href: "/feed/messages", label: "Messages", icon: MessageCircle },
];

export function MobileBottomNav({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to log out",
      );
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 flex h-[62px] items-center justify-around border-t border-black/5 bg-white lg:hidden dark:border-white/10 dark:bg-[#112032]"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-full w-14 items-center justify-center ${
                isActive
                  ? "text-[#1890ff]"
                  : "text-[#666] dark:text-white/70"
              }`}
            >
              <Icon className="size-6" strokeWidth={1.6} />
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
          className="flex h-full w-14 items-center justify-center text-[#666] dark:text-white/70"
        >
          <Menu className="size-6" strokeWidth={1.6} />
        </button>
      </nav>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-black/45 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsMenuOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="w-full rounded-t-2xl bg-white p-5 pb-8 dark:bg-[#112032] dark:text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={resolveAvatarUrl(user.avatarKey)}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded px-3 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Sun className="size-5 dark:hidden" strokeWidth={1.6} />
                <Moon className="hidden size-5 dark:block" strokeWidth={1.6} />
                Switch theme
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded px-3 py-3 text-sm hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
              >
                <LogOut className="size-5" strokeWidth={1.6} />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
              {error && (
                <p role="alert" className="px-3 text-xs text-[#d92d20]">
                  {error}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
