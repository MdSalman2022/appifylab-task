"use client";

import Image from "next/image";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, logout } from "../../_lib/auth/auth-client";
import type { AuthUser } from "../../_lib/auth/auth-contract";

export function ProfileMenu({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative ml-2 shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2"
      >
        <Image
          src="/assets/images/profile.png"
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
          className="absolute right-0 top-10 w-40 rounded-md border border-black/10 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#112032]"
        >
          <button
            role="menuitem"
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-[#112032] hover:bg-black/5 disabled:opacity-60 dark:text-white dark:hover:bg-white/10"
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
      )}
    </div>
  );
}
