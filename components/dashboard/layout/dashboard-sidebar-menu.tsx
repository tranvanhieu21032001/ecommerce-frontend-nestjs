"use client";

import Link from "next/link";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SidebarItem = {
  label: string;
  href: string;
  icon: () => ReactNode;
};

type SidebarSectionProps = {
  title: string;
  items: SidebarItem[];
  pathname: string;
  collapsed: boolean;
};

export function SidebarSection({
  title,
  items,
  pathname,
  collapsed,
}: SidebarSectionProps) {
  return (
    <div className="mb-7">
      {!collapsed ? (
        <p className="px-2 text-[12px] font-medium text-[#7C8794]">{title}</p>
      ) : null}
      <nav
        className={cn("mt-3 flex flex-col gap-2", collapsed && "items-center")}
      >
        {items.map((item) => (
          <SidebarNavItem
            key={item.label}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </div>
  );
}

type SidebarNavItemProps = {
  item: SidebarItem;
  pathname: string;
  collapsed: boolean;
};

function SidebarNavItem({ item, pathname, collapsed }: SidebarNavItemProps) {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-[42px] items-center rounded-xl px-3 text-[14px] md:text-[16px] font-medium transition-colors",
        collapsed ? "w-12 justify-center" : "gap-3",
        isActive
          ? "bg-[color:var(--color-primary)] text-white shadow-sm"
          : "text-[#6B7280] hover:bg-[#F5F7FB] hover:text-[#1F2937]",
      )}
    >
      <Icon />
      {!collapsed ? <span>{item.label}</span> : null}
    </Link>
  );
}
