import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { href: string; label: string };
  size?: "sm" | "lg";
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "lg",
}: EmptyStateProps) {
  const isLarge = size === "lg";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isLarge ? "px-6 py-16" : "px-5 py-10"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative flex items-center justify-center rounded-full border border-dashed border-[#1890ff]/40 ${
          isLarge ? "size-24" : "size-16"
        }`}
      >
        <span
          className={`flex items-center justify-center rounded-full bg-[#e4f1fd] text-[#1890ff] dark:bg-[#123150] ${
            isLarge ? "size-[72px]" : "size-12"
          }`}
        >
          <Icon className={isLarge ? "size-8" : "size-5"} strokeWidth={1.5} />
        </span>
        <span className="absolute -right-0.5 top-1 size-2 rounded-full bg-[#4d8dff]/60" />
        <span className="absolute -left-1 bottom-3 size-1.5 rounded-full bg-[#0acf83]/60" />
      </span>
      <h3
        className={`font-medium text-[#112032] dark:text-white ${
          isLarge ? "mt-6 text-lg" : "mt-4 text-sm"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-1 text-[#8a8e98] dark:text-white/60 ${
          isLarge ? "max-w-sm text-sm" : "max-w-60 text-xs"
        }`}
      >
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className={`mt-5 inline-flex items-center justify-center rounded bg-[#1890ff] font-medium text-white transition-colors hover:bg-[#377dff] ${
            isLarge ? "h-11 px-6 text-sm" : "h-9 px-4 text-xs"
          }`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
