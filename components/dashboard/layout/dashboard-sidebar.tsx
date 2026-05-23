"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ReactSVG } from "react-svg";
import { cn } from "@/lib/cn";
import { SidebarSection, type SidebarItem } from "./dashboard-sidebar-menu";

type SidebarGroup = {
  title: string;
  items: SidebarItem[];
};

const sidebarSections: SidebarGroup[] = [
  {
    title: "Main menu",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: () => <SidebarSvgIcon src="/icons/dashboard.svg" />,
      },
      {
        label: "Order Management",
        href: "#",
        icon: () => <SidebarSvgIcon src="/icons/order.svg" />,
      },
      {
        label: "Customers",
        href: "/dashboard/users",
        icon: () => <SidebarSvgIcon src="/icons/customer.svg" />,
      },
      {
        label: "Coupon Code",
        href: "#",
        icon: () => <SidebarSvgIcon src="/icons/coupon.svg" />,
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: () => <SidebarSvgIcon src="/icons/categories.svg" />,
      },
      {
        label: "Transaction",
        href: "#",
        icon: () => <SidebarSvgIcon src="/icons/transaction.svg" />,
      },
      {
        label: "Brand",
        href: "/dashboard/brands",
        icon: () => <SidebarSvgIcon src="/icons/brand.svg" />,
      },
      {
        label: "Tags",
        href: "/dashboard/tags",
        icon: () => <SidebarSvgIcon src="/icons/tag.svg" />,
      },
      {
        label: "Variants",
        href: "/dashboard/variants",
        icon: () => <SidebarSvgIcon src="/icons/variant.svg" />,
      },
    ],
  },
  {
    title: "Product",
    items: [
      {
        label: "Add Products",
        href: "#",
        icon: () => <SidebarSvgIcon src="/icons/add.svg" />,
      },
      {
        label: "Product Media",
        href: "#",
        icon: () => <SidebarSvgIcon src="/icons/media.svg" />,
      },
      {
        label: "Product List",
        href: "#",
        icon: () => <SidebarSvgIcon src="/icons/product-list.svg" />,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Admin role", href: "#", icon: UserBadgeIcon },
      { label: "Control Authority", href: "#", icon: SettingsIcon },
    ],
  },
];

type DashboardSidebarProps = {
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardSidebar({
  user,
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const initials = useMemo(() => {
    const first = user.firstName?.[0] ?? "";
    const last = user.lastName?.[0] ?? "";
    return (first + last || user.email[0] || "A").toUpperCase();
  }, [user.email, user.firstName, user.lastName]);

  return (
    <aside
      className={cn(
        "group relative flex h-full shrink-0 flex-col border-r border-[#E5E7EB] bg-white transition-all duration-200",
        collapsed ? "w-[96px]" : "w-[300px]",
      )}
    >
      <div className="relative flex h-[88px] items-center px-6">
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-3 overflow-hidden font-black tracking-tight text-[color:var(--color-primary)] transition-all duration-200",
          )}
        >
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-white">
            <Image
              src="/images/logo.png"
              alt="E-Com"
              width={36}
              height={36}
              priority
              className="h-[36px] w-[36px] object-contain"
            />
          </div>
          {!collapsed ? (
            <span className="min-w-0 truncate text-[20px] font-bold md:text-[28px]">
              The Hole
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "absolute right-[-18px] top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full outline-none border border-primary bg-white text-[#6B7280] shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]",
            "opacity-0 group-hover:opacity-100",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ReactSVG
            src="/icons/expand.svg"
            wrapper="span"
            beforeInjection={(svg) => {
              svg.setAttribute(
                "class",
                cn(
                  "h-[18px] w-[18px] transition-transform duration-200",
                  collapsed ? "rotate-180" : "",
                ),
              );
              svg.setAttribute("width", "18");
              svg.setAttribute("height", "18");
            }}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {sidebarSections.map((section) => (
          <SidebarSection
            key={section.title}
            title={section.title}
            items={section.items}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div className="border-t border-[#E5E7EB] p-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3",
            collapsed && "justify-center",
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-sm font-bold text-white">
            {initials}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#1F2937]">
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                  : "Admin"}
              </p>
              <p className="truncate text-[12px] text-[#7C8794]">
                {user.email}
              </p>
            </div>
          ) : null}
          {!collapsed ? (
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7C8794] transition-colors hover:bg-white hover:text-[#1F2937]"
              aria-label="Sign out"
            >
              <LogoutIcon />
            </button>
          ) : null}
        </div>

        {!collapsed ? (
          <Link
            href="/"
            className="mt-4 flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-semibold text-[#0F4C5C] shadow-sm transition-colors hover:bg-[#F8FAFC]"
          >
            <span className="flex items-center gap-3">
              <ShopIcon />
              Your Shop
            </span>
            <ExternalIcon />
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

function SidebarSvgIcon({ src }: { src: string }) {
  return (
    <ReactSVG
      src={src}
      wrapper="span"
      beforeInjection={(svg) => {
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("class", "h-[22px] w-[22px]");
        svg.setAttribute("width", "22");
        svg.setAttribute("height", "22");
      }}
    />
  );
}

function UserBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="8.5"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6 19a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="m12 4 1.1 2.1 2.4.5-.3 2.4 1.7 1.7 2.4-.3.5 2.4L20 14l-1.1 2.1 1 2.3-2.4.5-.5 2.4-2.4-.3-1.7 1.7-.5 2.4L12 20l-2.1 1.1-.5-2.4-2.4.3-.5-2.4-2.4-.5 1-2.3L4 14l1.1-2.1-1-2.3 2.4-.5.5-2.4 2.4.3L11.9 5 12 4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M10 17v2a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8l4 4-4 4M18 12H10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 10h16v9H4z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M3 6h18v4H3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 14h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14 5h5v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14 19 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
