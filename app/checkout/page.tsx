import { Poppins } from "next/font/google";

import { CheckoutContent } from "@/components/checkout/checkout-content";
import { ShopShell } from "@/components/home/shop-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type CheckoutPageProps = {
  searchParams: Promise<{
    productId?: string | string[];
    variationId?: string | string[];
    quantity?: string | string[];
    cartId?: string | string[];
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const query = await searchParams;
  const productId = readQueryValue(query.productId);
  const variationId = readQueryValue(query.variationId);
  const cartId = readQueryValue(query.cartId);
  const requestedQuantity = Number(readQueryValue(query.quantity));
  const quantity =
    Number.isInteger(requestedQuantity) && requestedQuantity > 0
      ? requestedQuantity
      : 1;

  return (
    <ShopShell className={poppins.className}>
      <CheckoutContent
        initialProductId={productId}
        initialVariationId={variationId}
        initialQuantity={quantity}
        cartId={cartId}
      />
    </ShopShell>
  );
}

function readQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
