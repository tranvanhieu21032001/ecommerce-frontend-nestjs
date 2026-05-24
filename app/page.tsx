import { Poppins } from "next/font/google";

import { ShopHomePage } from "@/components/home/shop-home-page";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export default function Page() {
  return <ShopHomePage className={poppins.className} />;
}
