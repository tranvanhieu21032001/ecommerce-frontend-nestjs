import { Poppins } from "next/font/google";

import { ShopPageContent } from "@/components/home/shop-page-content";
import { ShopShell } from "@/components/home/shop-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string | string[];
    brandId?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const categoryId = query.categoryId;
  const brandId = query.brandId;
  const initialCategoryId =
    typeof categoryId === "string" ? categoryId : categoryId?.[0] ?? null;
  const initialBrandId =
    typeof brandId === "string" ? brandId : brandId?.[0] ?? null;

  return (
    <ShopShell className={poppins.className}>
      <ShopPageContent
        initialCategoryId={initialCategoryId}
        initialBrandId={initialBrandId}
      />
    </ShopShell>
  );
}
