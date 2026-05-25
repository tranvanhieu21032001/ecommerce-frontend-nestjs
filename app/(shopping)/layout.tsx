import { Poppins } from "next/font/google";

import { ProtectedShopContent } from "@/components/home/protected-shop-content";
import { ShopShell } from "@/components/home/shop-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopShell className={poppins.className}>
      <ProtectedShopContent>{children}</ProtectedShopContent>
    </ShopShell>
  );
}
