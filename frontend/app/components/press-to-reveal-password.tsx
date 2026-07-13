"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PressToRevealPasswordProps = {
  id: string;
  name: string;
  label: string;
  className: string;
  minLength?: number;
  autoComplete: "current-password" | "new-password";
};

export function PressToRevealPassword({
  id,
  name,
  label,
  className,
  minLength,
  autoComplete,
}: PressToRevealPasswordProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#1f2937]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isRevealed ? "text" : "password"}
          required
          minLength={minLength}
          maxLength={128}
          autoComplete={autoComplete}
          className={`${className} pr-12`}
        />
        <button
          type="button"
          aria-label={isRevealed ? "Hide password" : "Show password"}
          aria-pressed={isRevealed}
          onClick={() => setIsRevealed((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-12 select-none items-center justify-center text-[#667085] outline-none transition-colors hover:text-[#4f8cff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4f8cff]"
        >
          {isRevealed ? (
            <EyeOff aria-hidden size={20} strokeWidth={1.8} />
          ) : (
            <Eye aria-hidden size={20} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </div>
  );
}
