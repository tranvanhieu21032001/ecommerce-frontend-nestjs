"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (!active) {
          return;
        }

        if (currentUser.role !== "ADMIN") {
          router.replace("/");
          return;
        }

        setUser(currentUser);
      } catch {
        if (active) {
          router.replace("/");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  }

  const pageTitle =
    pathname === "/dashboard/orders"
      ? "Order Management"
      : pathname === "/dashboard/tags"
      ? "Tags"
      : pathname === "/dashboard/brands"
        ? "Brands"
        : pathname === "/dashboard/categories"
          ? "Categories"
          : pathname === "/dashboard/variants"
            ? "Variants"
            : pathname === "/dashboard/coupons"
              ? "Coupon Codes"
              : pathname === "/dashboard/flash-sales"
                ? "Flash Sales"
              : pathname === "/dashboard/products"
                ? "Product List"
                : pathname === "/dashboard/products/add"
                  ? "Add Product"
                  : pathname.startsWith("/dashboard/products/edit/")
                    ? "Edit Product"
                  : "Dashboard";

  if (isLoading) {
    return (
      <main className="flex h-screen overflow-hidden items-center justify-center bg-[#F5F7FB] px-6 py-10">
        <p className="text-[color:var(--color-subtext)]">Checking access...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#F5F7FB]">
      <DashboardSidebar
        user={{
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-subtext)]">
              Admin area
            </p>
            <h1 className="mt-1 text-[22px] font-bold text-[#1B3268]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="w-auto px-4"
              onClick={() => router.push("/")}
            >
              View site
            </Button>
          </div>
        </header>

        <div className="min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
