import { Poppins } from "next/font/google";

import { ShopPageContent } from "@/components/home/shop-page-content";
import { ShopShell } from "@/components/home/shop-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export default function ShopPage() {
  return (
    <ShopShell className={poppins.className}>
      <ShopPageContent />
    </ShopShell>
  );
}
