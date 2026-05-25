import { HomeBanner } from "@/components/home/home-banner";
import { HomeCategories } from "@/components/home/home-categories";
import { LatestBlog } from "@/components/home/latest-blog";
import { ProductGrid } from "@/components/home/product-grid";
import { ShopByBrands } from "@/components/home/shop-by-brands";
import { ShopContainer } from "@/components/home/shop-container";
import { ShopShell } from "@/components/home/shop-shell";

export function ShopHomePage({ className }: { className?: string }) {
  return (
    <ShopShell className={className}>
      <ShopContainer>
        <HomeBanner />
        <ProductGrid />
        <HomeCategories />
        <ShopByBrands />
        <LatestBlog />
      </ShopContainer>
    </ShopShell>
  );
}
