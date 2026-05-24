import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Title({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-2xl font-bold text-[#151515]", className)}>
      {children}
    </h2>
  );
}

export function SubTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-[#151515]", className)}>
      {children}
    </h3>
  );
}

export function SubText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("text-sm text-[#52525B]", className)}>{children}</p>;
}
