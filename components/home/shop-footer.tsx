import Link from "next/link";

import { FooterCategories } from "@/components/home/footer-categories";
import { FooterTop } from "@/components/home/footer-top";
import { ShopContainer } from "@/components/home/shop-container";
import { ShopLogo } from "@/components/home/shop-logo";
import { SubText, SubTitle } from "@/components/home/title";

export function ShopFooter() {
  return (
    <footer className="bg-[#063C28] text-white">
      <ShopContainer className="py-10 lg:py-12">
        <FooterTop />
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.15fr]">
          <div className="max-w-sm space-y-5">
            <ShopLogo
              className="text-white hover:text-[#93D991]"
              spanClassName="text-[#93D991]"
            />
            <SubText className="leading-7 text-white/65">
              Discover curated collections at The Hole, blending style and
              comfort to elevate your everyday shopping.
            </SubText>
          </div>
          <FooterCategories />
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <SubTitle className="text-white">Newsletter</SubTitle>
            <SubText className="mt-3 leading-6 text-white/65">
              Subscribe to our newsletter to receive updates and exclusive
              offers.
            </SubText>
            <form className="mt-5 space-y-3">
              <input
                placeholder="Enter your email"
                type="email"
                required
                className="h-11 w-full rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/45 focus:border-[#93D991]"
              />
              <button
                type="submit"
                className="h-11 w-full rounded-full bg-[#3B9C3C] text-sm font-semibold text-white transition-colors hover:bg-[#4AB84B]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            <ShopLogo
              className="inline-flex text-sm text-white hover:text-[#93D991]"
              spanClassName="text-[#93D991]"
            />
            . All rights reserved.
          </div>
          <div className="flex gap-5">
            <Link href="#" className="transition-colors hover:text-[#93D991]">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-[#93D991]">
              Terms
            </Link>
          </div>
        </div>
      </ShopContainer>
    </footer>
  );
}
