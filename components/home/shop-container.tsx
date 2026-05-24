import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function ShopContainer({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto max-w-screen-xl px-4", className)} {...props}>
      {children}
    </div>
  );
}
