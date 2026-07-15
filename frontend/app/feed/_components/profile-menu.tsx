"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageCircle,
  Moon,
  Settings,
  Sun,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ApiError, logout } from "../../_lib/auth/auth-client";
import type { AuthUser } from "../../_lib/auth/auth-contract";
import { resolveAvatarUrl } from "../../_lib/uploads/media-url";
import { toggleTheme } from "./feed-theme";

export function ProfileMenu({ user }: { user: AuthUser }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isOpen]);

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
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative ml-2 shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2"
      >
        <Image
          src={resolveAvatarUrl(user.avatarKey)}
          alt=""
          width={24}
          height={24}
          className="size-6 rounded-full object-cover"
        />
        <span className="text-base text-[#112032] dark:text-white">
          {user.firstName} {user.lastName}
        </span>
        <ChevronDown className="size-4" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-64 overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_8px_24px_rgba(149,157,165,0.2)] dark:border-white/10 dark:bg-[#112032]"
        >
          <div className="flex items-center gap-3 border-b border-black/10 px-4 py-4 dark:border-white/10">
            <Image
              src={resolveAvatarUrl(user.avatarKey)}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#112032] dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-black/45 dark:text-white/46">
                {user.email}
              </p>
            </div>
          </div>
          <div className="p-2">
            <MenuLink href="/feed/profile" label="View profile" icon={UserRound} onNavigate={() => setIsOpen(false)} />
            <MenuLink href="/feed/friends" label="Friends" icon={Users} onNavigate={() => setIsOpen(false)} />
            <MenuLink href="/feed/notifications" label="Notifications" icon={Bell} onNavigate={() => setIsOpen(false)} />
            <MenuLink href="/feed/messages" label="Messages" icon={MessageCircle} onNavigate={() => setIsOpen(false)} />
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-[#112032] hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
            >
              <Settings className="size-4" strokeWidth={1.6} />
              Appearance settings
              <Sun className="ml-auto size-4 dark:hidden" strokeWidth={1.6} />
              <Moon className="ml-auto hidden size-4 dark:block" strokeWidth={1.6} />
            </button>
          </div>
          <div className="border-t border-black/10 p-2 dark:border-white/10">
            <button
              role="menuitem"
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-[#112032] hover:bg-black/5 disabled:opacity-60 dark:text-white dark:hover:bg-white/10"
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
            {error && (
              <p role="alert" className="px-3 pb-2 text-xs text-[#d92d20]">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Users;
  onNavigate: () => void;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-[#112032] hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
    >
      <Icon className="size-4" strokeWidth={1.6} />
      {label}
    </Link>
  );
}
