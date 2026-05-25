import Link from "next/link";

import { ShopLogo } from "@/components/home/shop-logo";

export function ShopNoAccess({
  details = "Log in to view your cart items and checkout. Don't miss out on your favorite products!",
}: {
  details?: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-86px)] items-center justify-center bg-[#F5F6F8] p-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <ShopLogo className="text-[27px]" />
          <h1 className="mt-4 text-2xl font-bold text-[#151515]">
            Welcome Back!
          </h1>
        </div>

        <p className="mt-10 text-center text-sm font-medium leading-7 text-[#52525B]">
          {details}
        </p>

        <Link
          href="/login"
          className="mt-8 flex h-12 w-full items-center justify-center rounded-md bg-[#063C28]/80 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#063C28]"
        >
          Sign in
        </Link>

        <p className="mt-9 text-center text-sm text-[#52525B]">
          Don&apos;t have an account?
        </p>

        <Link
          href="/register"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-sm font-medium text-[#151515] shadow-sm transition-colors hover:bg-[#FAFAFA]"
        >
          Create an account
        </Link>
      </section>
    </div>
  );
}
