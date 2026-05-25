"use client";

import {
  Heart,
  LogOut,
  Logs,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ShopContainer } from "@/components/home/shop-container";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";
import { headerLinks } from "@/lib/mock/home";
import { cn } from "@/lib/cn";

export function ShopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsCheckingAuth(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/70 py-5 backdrop-blur-md">
      <ShopContainer className="flex items-center justify-between text-[#52525B]">
        <div className="flex w-auto items-center justify-start gap-2.5 md:w-1/3 md:gap-0">
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex text-[#151515] transition-colors hover:text-[#3B9C3C] md:hidden"
          >
            <Menu size={22} />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[#063C28] transition-colors duration-300 hover:text-[#3B9C3C]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Image
                src="/images/logo.png"
                alt="The Hole"
                width={40}
                height={40}
                priority
                className="h-[40px] w-[40px] object-contain"
              />
            </span>
            <span className="hidden text-xl font-bold sm:inline-flex">
              The Hole
            </span>
          </Link>
        </div>

        <nav className="hidden w-1/3 items-center justify-center gap-7 text-sm font-semibold capitalize text-[#52525B] md:inline-flex">
          {headerLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "group relative transition-colors duration-300 hover:text-[#3B9C3C]",
                pathname === item.href && "text-[#3B9C3C]",
              )}
            >
              {item.title}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-1/2 h-0.5 w-0 bg-[#3B9C3C] transition-all duration-300 group-hover:left-0 group-hover:w-1/2",
                  pathname === item.href && "left-0 w-1/2",
                )}
              />
              <span
                className={cn(
                  "absolute -bottom-0.5 right-1/2 h-0.5 w-0 bg-[#3B9C3C] transition-all duration-300 group-hover:right-0 group-hover:w-1/2",
                  pathname === item.href && "right-0 w-1/2",
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex w-auto items-center justify-end gap-5 md:w-1/3">
          <button
            type="button"
            aria-label="Search"
            className="transition-colors duration-300 hover:text-[#3B9C3C]"
          >
            <Search size={20} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative transition-colors duration-300 hover:text-[#3B9C3C]"
          >
            <ShoppingBag size={21} />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#063D29] text-[10px] font-semibold text-white">
              3
            </span>
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden transition-colors duration-300 hover:text-[#3B9C3C] sm:inline-flex"
          >
            <Heart size={21} />
          </Link>
          {isCheckingAuth ? (
            <span className="hidden h-7 w-7 animate-pulse rounded-full bg-[#063C28]/10 sm:inline-flex" />
          ) : user ? (
            <>
              <button
                type="button"
                aria-label="Orders"
                className="group relative hidden transition-colors duration-300 hover:text-[#3B9C3C] sm:inline-flex"
              >
                <Logs className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#063D29] text-[10px] font-semibold text-white">
                  0
                </span>
              </button>
              <AccountMenu
                user={user}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1 rounded-full border border-[#063C28]/20 px-3 py-1.5 text-sm font-semibold text-[#063C28] transition-colors duration-300 hover:border-[#3B9C3C] hover:text-[#3B9C3C] sm:inline-flex"
            >
              <UserRound className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </ShopContainer>
    </header>
  );
}

function AccountMenu({
  user,
  isLoggingOut,
  onLogout,
}: {
  user: AuthUser;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email;
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    user.email[0].toUpperCase();

  return (
    <details className="group relative hidden sm:block">
      <summary
        aria-label="Open account menu"
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-[#063C28] text-sm font-semibold text-white transition-colors marker:content-none hover:bg-[#3B9C3C]"
      >
        {initials}
      </summary>
      <div className="absolute right-0 top-12 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#063C28] text-[13px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium leading-5 text-[#27272A]">
              {name}
            </p>
            <p className="truncate text-[13px] leading-5 text-[#71717A]">
              {user.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-disabled="true"
          className="flex w-full items-center gap-4 border-b border-[#E5E7EB] px-6 py-4 text-left text-[13px] font-medium text-[#52525B] transition-colors hover:bg-[#FAFAFA]"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Manage account
        </button>
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={onLogout}
          className="flex w-full items-center gap-4 px-6 py-4 text-left text-[13px] font-medium text-[#52525B] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </details>
  );
}
