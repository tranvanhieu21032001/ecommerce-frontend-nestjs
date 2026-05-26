import { AddProductManager } from "@/components/dashboard/products/add-product-manager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AddProductManager productId={id} />;
}
