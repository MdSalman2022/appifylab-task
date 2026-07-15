"use client";

import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

export function toggleTheme() {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

  root.dataset.theme = nextTheme;
  window.localStorage.setItem("theme", nextTheme);
}

export function FeedTheme({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#112032] transition-colors duration-150 dark:bg-[#232e42] dark:text-white">
      <div className="fixed right-4 top-1/2 z-[60] -translate-y-1/2 max-lg:hidden">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="relative flex h-[66px] w-8 flex-col items-center justify-between rounded-full border border-[#1890ff] bg-[#4d8dff] p-1 text-white"
        >
          <Sun className="size-4" aria-hidden="true" />
          <Moon className="size-4" aria-hidden="true" />
          <span
            className="absolute left-1/2 top-1 size-5 -translate-x-1/2 translate-y-0 rounded-full bg-white transition-transform dark:translate-y-[34px]"
            aria-hidden="true"
          />
        </button>
      </div>
      {children}
    </div>
  );
}
