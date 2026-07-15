"use client";

import {
  Bell,
  Home,
  MessageCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { EmptyState } from "./empty-state";

type PanelKind = "friends" | "notifications" | "messages";

const panels: Record<
  PanelKind,
  {
    label: string;
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    actionLabel: string;
  }
> = {
  friends: {
    label: "Friend requests",
    icon: Users,
    title: "No friend requests yet",
    description:
      "When someone wants to connect with you, their request will show up here.",
    href: "/feed/friends",
    actionLabel: "See all friends",
  },
  notifications: {
    label: "Notifications",
    icon: Bell,
    title: "No notifications yet",
    description:
      "Likes, comments, and replies on your posts will show up here.",
    href: "/feed/notifications",
    actionLabel: "See all notifications",
  },
  messages: {
    label: "Messages",
    icon: MessageCircle,
    title: "No messages yet",
    description:
      "Start a conversation with a friend and it will show up here.",
    href: "/feed/messages",
    actionLabel: "Open messages",
  },
};

export function HeaderActions() {
  const [openPanel, setOpenPanel] = useState<PanelKind | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openPanel) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPanel(null);
    }
    function onMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenPanel(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [openPanel]);

  function togglePanel(kind: PanelKind) {
    setOpenPanel((current) => (current === kind ? null : kind));
  }

  return (
    <nav
      ref={containerRef}
      aria-label="Primary navigation"
      className="ml-auto flex h-full items-center"
    >
      <Link
        href="/feed"
        aria-label="Home"
        className="relative flex h-full w-[78px] items-center justify-center border-b-2 border-[#1890ff] text-[#1890ff]"
      >
        <Home className="size-[23px]" strokeWidth={1.6} />
      </Link>
      {(Object.keys(panels) as PanelKind[]).map((kind) => {
        const panel = panels[kind];
        const Icon = panel.icon;
        const isOpen = openPanel === kind;
        return (
          <div key={kind} className="relative flex h-full">
            <button
              type="button"
              aria-label={panel.label}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              onClick={() => togglePanel(kind)}
              className={`relative flex h-full w-[78px] items-center justify-center transition-colors ${
                isOpen
                  ? "text-[#1890ff]"
                  : "text-[#666] hover:text-[#1890ff] dark:text-white dark:hover:text-[#1890ff]"
              }`}
            >
              <Icon className="size-[23px]" strokeWidth={1.6} />
            </button>
            {isOpen && (
              <section
                role="dialog"
                aria-label={panel.label}
                className="absolute right-0 top-[70px] z-50 w-80 rounded-md border border-black/10 bg-white shadow-[0_8px_24px_rgba(149,157,165,0.2)] dark:border-white/10 dark:bg-[#112032] dark:text-white"
              >
                <header className="border-b border-black/10 px-5 py-3 dark:border-white/10">
                  <h2 className="text-sm font-medium">{panel.label}</h2>
                </header>
                <EmptyState
                  size="sm"
                  icon={Icon}
                  title={panel.title}
                  description={panel.description}
                  action={{ href: panel.href, label: panel.actionLabel }}
                />
              </section>
            )}
          </div>
        );
      })}
    </nav>
  );
}
