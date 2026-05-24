import Link from "next/link";

import { FooterTop } from "@/components/home/footer-top";
import { ShopContainer } from "@/components/home/shop-container";
import { ShopLogo } from "@/components/home/shop-logo";
import { SubText, SubTitle } from "@/components/home/title";
import { footerCategories, quickLinks } from "@/lib/mock/home";

export function ShopFooter() {
  return (
    <footer className="border-t bg-white">
      <ShopContainer>
        <FooterTop />
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <ShopLogo />
            <SubText>
              Discover curated collections at Shopcart, blending style and
              comfort to elevate your everyday shopping.
            </SubText>
            <div className="flex gap-3 text-[#151515]/60">
              {["f", "ig", "x", "in"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#151515]/30 text-xs font-bold transition-colors duration-300 hover:border-[#3B9C3C] hover:text-[#3B9C3C]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <FooterLinks title="Quick Links" links={quickLinks} />
          <FooterLinks title="Categories" links={footerCategories} />
          <div className="space-y-4">
            <SubTitle>Newsletter</SubTitle>
            <SubText>
              Subscribe to our newsletter to receive updates and exclusive
              offers.
            </SubText>
            <form className="space-y-3">
              <input
                placeholder="Enter your email"
                type="email"
                required
                className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-sm outline-none transition-colors focus:border-[#3B9C3C]"
              />
              <button
                type="submit"
                className="h-10 w-full rounded-md bg-[#063C28] text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t py-6 text-center text-sm text-gray-600">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            <ShopLogo className="inline-flex text-sm" />. All rights reserved.
          </div>
        </div>
      </ShopContainer>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <SubTitle>{title}</SubTitle>
      <ul className="mt-4 space-y-3">
        {links.map((item) => (
          <li key={item}>
            <Link
              href="#products"
              className="font-medium transition-colors duration-300 hover:text-[#3B9C3C]"
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
