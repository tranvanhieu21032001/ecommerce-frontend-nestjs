import { notFound } from "next/navigation";
import { Poppins } from "next/font/google";

import { ProductDetailPage } from "@/components/home/product-detail-page";
import { ShopShell } from "@/components/home/shop-shell";
import { getProduct, type Product } from "@/lib/api/products";
import { products } from "@/lib/mock/home";
import type { HomeProduct } from "@/lib/mock/home";

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
  let product = products.find((item) => item.id === id);

  if (!product) {
    try {
      product = toHomeProduct(await getProduct(id));
    } catch {
      notFound();
    }
  }

  return (
    <ShopShell className={poppins.className}>
      <ProductDetailPage product={product} />
    </ShopShell>
  );
}

function toHomeProduct(product: Product): HomeProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? "Uncategorized",
    image:
      product.images?.find((image) => image.isPrimary)?.imageUrl ??
      product.imageUrl ??
      "/icons/product-list.svg",
    price: product.price,
    stock: product.stock,
  };
}
