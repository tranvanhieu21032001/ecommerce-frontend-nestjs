import { Poppins } from "next/font/google";

import { CheckoutContent } from "@/components/checkout/checkout-content";
import { ShopShell } from "@/components/home/shop-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function CheckoutPage() {
  return (
    <ShopShell className={poppins.className}>
      <CheckoutContent />
    </ShopShell>
  );
}
