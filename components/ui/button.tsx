import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "default" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseStyles =
  "h-[44px] w-full max-w-full rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-secondary focus-visible:ring-[#0088FF]",
  default:
    "border border-[#E5E7EB] bg-transparent text-[#1B3268] hover:bg-[#F8FAFC] focus-visible:ring-[#0088FF]",
  danger:
    "bg-[color:var(--color-danger)] text-white hover:brightness-95 focus-visible:ring-[color:var(--color-danger)]",
};

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}
