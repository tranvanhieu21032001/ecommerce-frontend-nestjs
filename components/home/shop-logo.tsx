import Link from "next/link";

import { cn } from "@/lib/cn";

export function ShopLogo({
  className,
  spanClassName,
}: {
  className?: string;
  spanClassName?: string;
}) {
  return (
    <Link href="/" className="inline-flex">
      <h2
        className={cn(
          "text-2xl font-black uppercase tracking-wider text-[#063C28] transition-colors duration-300 hover:text-[#3B9C3C]",
          className,
        )}
      >
        Shopcar
        <span
          className={cn(
            "text-[#3B9C3C] transition-colors duration-300",
            spanClassName,
          )}
        >
          t
        </span>
      </h2>
    </Link>
  );
}
