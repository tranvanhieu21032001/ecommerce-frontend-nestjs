import { Poppins } from "next/font/google";

import { ShopShell } from "@/components/home/shop-shell";
import { ProtectedShopContent } from "@/components/home/protected-shop-content";
import { WishlistPageContent } from "@/components/home/wishlist-page-content";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function WishlistPage() {
  return (
    <ShopShell className={poppins.className}>
      <ProtectedShopContent details="Log in to see your wishlist and save the products you love. Don't miss your favorite deals!">
        <WishlistPageContent />
      </ProtectedShopContent>
    </ShopShell>
  );
}
