"use client";

import { Check, ChevronDown, Globe2, Lock } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { PostVisibility } from "../../_lib/posts/post-contract";

export const visibilityOptions: Record<
  PostVisibility,
  { label: string; description: string; icon: typeof Globe2 }
> = {
  PUBLIC: {
    label: "Public",
    description: "Anyone on BuddyScript",
    icon: Globe2,
  },
  PRIVATE: {
    label: "Private",
    description: "Only you",
    icon: Lock,
  },
};

type VisibilitySelectProps = {
  value: PostVisibility;
  onChange: (value: PostVisibility) => void;
  disabled?: boolean;
  direction?: "up" | "down";
};

export function VisibilitySelect({
  value,
  onChange,
  disabled = false,
  direction = "up",
}: VisibilitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = visibilityOptions[value];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    function onMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Post visibility"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 items-center gap-1.5 rounded-full bg-[#e4f1fd] px-3.5 text-sm font-medium text-[#1890ff] transition-colors hover:bg-[#d3e9fc] disabled:opacity-60 dark:bg-[#123150] dark:hover:bg-[#16395d]"
      >
        <SelectedIcon className="size-4" strokeWidth={1.8} />
        {selected.label}
        <ChevronDown
          className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Choose who can see this post"
          className={`absolute right-0 z-20 w-64 rounded-md border border-black/10 bg-white p-1 shadow-[0_8px_24px_rgba(149,157,165,0.25)] dark:border-white/10 dark:bg-[#112032] ${
            direction === "up" ? "bottom-12" : "top-12"
          }`}
        >
          {(Object.keys(visibilityOptions) as PostVisibility[]).map((option) => {
            const { label, description, icon: Icon } = visibilityOptions[option];
            const isSelected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                    isSelected ? "bg-[#e4f1fd]/60 dark:bg-[#123150]/60" : ""
                  }`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f0f2f5] text-[#555b64] dark:bg-[#232e42] dark:text-white/80">
                    <Icon className="size-[18px]" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[#112032] dark:text-white">
                      {label}
                    </span>
                    <span className="block text-xs text-[#8a8e98] dark:text-white/60">
                      {description}
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="size-4 shrink-0 text-[#1890ff]" strokeWidth={2.2} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
