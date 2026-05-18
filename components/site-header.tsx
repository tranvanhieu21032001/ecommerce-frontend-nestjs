import Link from "next/link";
import Image from "next/image";
import type { ButtonHTMLAttributes } from "react";

const navItems = ["Home", "Shop", "Contact us"] as const;

export function SiteHeader() {
  return (
    <header className="w-full border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-[84px] w-full max-w-[1440px] items-center gap-8 px-6 lg:px-10">
        <Link href="/" aria-label="Go to homepage" className="shrink-0">
          <Image
            src="/images/logo.png"
            alt="The Hole"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : "#"}
              className="text-[18px] font-medium text-[#1F1F1F] transition-colors hover:text-[#0B2C91]"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex w-full max-w-[620px] items-center gap-4">
          <label className="flex h-[56px] w-full items-center rounded-[10px] bg-[#F3F3F3] px-6">
            <span className="sr-only">Search here</span>
            <input
              type="search"
              placeholder="Search here"
              className="h-full w-full bg-transparent text-[18px] text-[#1F1F1F] placeholder:text-[#9A9A9A] focus:outline-none"
            />
            <SearchIcon />
          </label>

          <IconButton aria-label="Wishlist">
            <HeartIcon />
          </IconButton>
          <IconButton aria-label="Cart">
            <CartIcon />
          </IconButton>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-[#E5E7EB]">
              <Image
                src="/images/logo.png"
                alt="Anne Doe"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[18px] font-medium text-[#1F1F1F]">
              Anne Doe
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center text-[#1F1F1F] transition-colors hover:text-[#0B2C91]"
      {...props}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-4.4-9.2-8.8C.9 8.7 2.8 5.5 6.2 5.1c1.8-.2 3.4.6 4.3 1.9.9-1.3 2.5-2.1 4.3-1.9 3.4.4 5.3 3.6 3.4 7.1C19 16.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 4h2l2.1 10.4A2 2 0 0 0 9.1 16h7.9a2 2 0 0 0 2-1.6L21 7H6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
