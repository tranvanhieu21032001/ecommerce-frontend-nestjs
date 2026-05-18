"use client";

import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  success?: string;
  leadingIcon?: ReactNode;
  showPasswordToggle?: boolean;
  isRequired?: boolean;
};

export function Input({
  label,
  id,
  className,
  error,
  success,
  leadingIcon,
  type,
  showPasswordToggle = false,
  isRequired = false,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const shouldShowToggle = showPasswordToggle && isPasswordField;
  const resolvedType = shouldShowToggle
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  return (
    <div className="flex w-full max-w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {isRequired ? (
            <span className="ml-1 text-[color:var(--color-danger)]">*</span>
          ) : null}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-[#9A9A9A]">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          type={resolvedType}
          className={cn(
            "h-[44px] w-full rounded border border-[#E5E7EB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[color:var(--color-subtext)] transition-colors focus:border-[#0088FF] focus:outline-none",
            leadingIcon ? "pl-11" : undefined,
            shouldShowToggle && "pr-12",
            error &&
              "border-[color:var(--color-danger)] focus:border-[color:var(--color-danger)]",
            success &&
              !error &&
              "border-[color:var(--color-primary)]",
            className,
          )}
          aria-required={isRequired || undefined}
          aria-invalid={Boolean(error) || undefined}
          {...props}
        />
        {shouldShowToggle ? (
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute right-4 top-1/2 flex -translate-y-1/2 text-[#9A9A9A] transition-colors hover:text-[#0B2C91] focus:outline-none"
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>
      <p
        className={cn(
          "min-h-[16px] text-[11px] leading-4 text-left",
          error
            ? "text-[color:var(--color-danger)]"
            : success
              ? "text-[color:var(--color-primary)]"
              : "text-transparent",
        )}
        aria-live="polite"
      >
        {error || success || " "}
      </p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
      <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a18.8 18.8 0 0 1-3.1 4.1" />
      <path d="M6.4 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4-.7" />
    </svg>
  );
}
