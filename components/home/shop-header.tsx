"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CartIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/home/shop-icons";
import { ShopContainer } from "@/components/home/shop-container";
import { ShopLogo } from "@/components/home/shop-logo";
import { headerLinks } from "@/lib/mock/home";
import { cn } from "@/lib/cn";

export function ShopHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/70 py-5 backdrop-blur-md">
      <ShopContainer className="flex items-center justify-between text-[#52525B]">
        <div className="flex w-auto items-center justify-start gap-2.5 md:w-1/3 md:gap-0">
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex text-[#151515] transition-colors hover:text-[#3B9C3C] md:hidden"
          >
            <MenuIcon />
          </button>
          <ShopLogo />
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
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Cart"
            className="relative transition-colors duration-300 hover:text-[#3B9C3C]"
          >
            <CartIcon />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#063D29] text-[10px] font-semibold text-white">
              0
            </span>
          </button>
          <button
            type="button"
            aria-label="Wishlist"
            className="hidden transition-colors duration-300 hover:text-[#3B9C3C] sm:inline-flex"
          >
            <HeartIcon />
          </button>
          <Link
            href="/login"
            className="hidden items-center gap-1 rounded-full border border-[#063C28]/20 px-3 py-1.5 text-sm font-semibold text-[#063C28] transition-colors duration-300 hover:border-[#3B9C3C] hover:text-[#3B9C3C] sm:inline-flex"
          >
            <UserIcon className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </ShopContainer>
    </header>
  );
}
