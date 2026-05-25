import { notFound } from "next/navigation";
import { Poppins } from "next/font/google";

import { ProductDetailPage } from "@/components/home/product-detail-page";
import { ShopShell } from "@/components/home/shop-shell";
import { products } from "@/lib/mock/home";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return (
    <ShopShell className={poppins.className}>
      <ProductDetailPage product={product} />
    </ShopShell>
  );
}
