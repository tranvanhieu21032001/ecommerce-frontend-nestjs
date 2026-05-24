import { HomeBanner } from "@/components/home/home-banner";
import { HomeCategories } from "@/components/home/home-categories";
import { LatestBlog } from "@/components/home/latest-blog";
import { ProductGrid } from "@/components/home/product-grid";
import { ShopByBrands } from "@/components/home/shop-by-brands";
import { ShopContainer } from "@/components/home/shop-container";
import { ShopFooter } from "@/components/home/shop-footer";
import { ShopHeader } from "@/components/home/shop-header";

export function ShopHomePage({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex min-h-screen flex-col bg-white text-[#151515]">
        <ShopHeader />
        <main className="flex-1">
          <ShopContainer>
            <HomeBanner />
            <ProductGrid />
            <HomeCategories />
            <ShopByBrands />
            <LatestBlog />
          </ShopContainer>
        </main>
        <ShopFooter />
      </div>
    </div>
  );
}
