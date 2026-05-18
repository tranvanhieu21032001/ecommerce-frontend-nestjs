import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-12 lg:px-10">
        <div className="rounded-[24px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-subtext)]">
            The Hole
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[#1B3268]">
            Home navigation updated
          </h1>
          <p className="mt-2 max-w-2xl text-[color:var(--color-subtext)]">
            The top menu now shows Home instead of Men, Women, and Kids.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/login"
              className="inline-flex h-[44px] items-center justify-center rounded-lg bg-[#0B2C91] px-5 text-sm font-semibold text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#1B3268]"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
