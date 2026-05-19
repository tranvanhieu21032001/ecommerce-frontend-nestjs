"use client";

import { ReactSVG } from "react-svg";

import { cn } from "@/lib/cn";

type SvgIconProps = {
  src: string;
  size?: number;
  className?: string;
};

export function SvgIcon({ src, size = 20, className }: SvgIconProps) {
  return (
    <ReactSVG
      src={src}
      wrapper="span"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
      beforeInjection={(svg) => {
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("class", "block");
        svg.setAttribute("width", String(size));
        svg.setAttribute("height", String(size));
      }}
    />
  );
}
