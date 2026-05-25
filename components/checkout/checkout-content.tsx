"use client";

import { ArrowLeft, CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  cancelOrder,
  createPayOSOrder,
  createPayOSPaymentLink,
  type Order,
  type PayOSPaymentLink,
} from "@/lib/api/checkout";
import { getProducts, type Product } from "@/lib/api/products";

type FormValues = {
  productId: string;
  quantity: number;
};

const fieldClassName =
  "mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none transition-colors focus:border-[#158947]";

export function CheckoutContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({
    productId: "",
    quantity: 1,
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentLink, setPaymentLink] = useState<PayOSPaymentLink | null>(null);
  const [qrImage, setQrImage] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === formValues.productId,
  );
  const total = selectedProduct
    ? selectedProduct.price * formValues.quantity
    : 0;
  const hasWholeVndTotal = Number.isInteger(roundMoney(total));
  const suggestedQuantity = selectedProduct
    ? getPayOSQuantity(selectedProduct)
    : null;

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await getProducts({ isActive: true, page: 1, limit: 100 });
        const availableProducts = response.data.filter((product) => product.stock > 0);
        const preferredProduct =
          availableProducts
            .map((product) => ({
              product,
              quantity: getPayOSQuantity(product),
            }))
            .filter(
              (candidate): candidate is { product: Product; quantity: number } =>
                candidate.quantity !== null,
            )
            .sort(
              (left, right) =>
                left.product.price * left.quantity -
                right.product.price * right.quantity,
            )[0] ?? null;

        setProducts(availableProducts);
        if (preferredProduct) {
          setFormValues({
            productId: preferredProduct.product.id,
            quantity: preferredProduct.quantity,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Khong the tai san pham thanh toan.",
        );
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!paymentLink) {
      return;
    }

    QRCode.toDataURL(paymentLink.qrCode, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
      color: { dark: "#063C28", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) {
          setQrImage(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Khong the ve ma QR tu du lieu VietQR.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paymentLink]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct || !hasWholeVndTotal) {
      setError("PayOS yeu cau tong thanh toan la so nguyen VND.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setError("");
    setOrder(null);
    setPaymentLink(null);
    setQrImage("");
    setIsSubmitting(true);

    try {
      const createdOrder = await createPayOSOrder({
        items: [{ productId: selectedProduct.id, quantity: formValues.quantity }],
        shippingName: String(formData.get("shippingName") ?? "").trim() || undefined,
        shippingPhone: String(formData.get("shippingPhone") ?? "").trim() || undefined,
        shippingAddressLine1: String(formData.get("shippingAddressLine1") ?? "").trim(),
        shippingCity: String(formData.get("shippingCity") ?? "").trim(),
        shippingDistrict:
          String(formData.get("shippingDistrict") ?? "").trim() || undefined,
        notes: String(formData.get("notes") ?? "").trim() || undefined,
      });
      setOrder(createdOrder);
      const origin = window.location.origin;
      const link = await createPayOSPaymentLink(
        createdOrder.id,
        `${origin}/checkout/success`,
        `${origin}/checkout/cancel`,
      );

      setPaymentLink(link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Khong the tao thanh toan VietQR.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelOrder() {
    if (!order) {
      return;
    }

    setIsCancelling(true);
    setError("");
    try {
      const cancelledOrder = await cancelOrder(order.id);
      setOrder(cancelledOrder);
      setPaymentLink(null);
      setQrImage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Khong the huy don hang.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <main className="bg-[#FAFAFA] py-10">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#063C28] hover:text-[#3B9C3C]"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B9C3C]">
            PayOS sandbox flow
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#151515]">Thanh toan VietQR</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#52525B]">
            Chon san pham that tu API, tao don PAYOS va hien thi QR ngay tren trang nay.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-[#151515]/10 bg-white p-6"
          >
            <section>
              <h2 className="text-lg font-semibold text-[#151515]">San pham test</h2>
              {isLoadingProducts ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-[#52525B]">
                  <Loader2 className="animate-spin" size={16} />
                  Dang tai san pham tu API...
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_120px]">
                  <label className="text-sm font-medium text-[#151515]">
                    San pham
                    <select
                      required
                      value={formValues.productId}
                      onChange={(event) => {
                        const product = products.find(
                          (candidate) => candidate.id === event.target.value,
                        );
                        setFormValues({
                          productId: event.target.value,
                          quantity: product ? (getPayOSQuantity(product) ?? 1) : 1,
                        });
                      }}
                      className={fieldClassName}
                    >
                      <option value="">Chon san pham</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatVnd(product.price)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-[#151515]">
                    So luong
                    <input
                      required
                      type="number"
                      min={1}
                      max={selectedProduct?.stock ?? 1}
                      value={formValues.quantity}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          quantity: Math.max(1, Number(event.target.value) || 1),
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>
                </div>
              )}
              {selectedProduct && suggestedQuantity && suggestedQuantity > 1 ? (
                <p className="mt-3 text-xs leading-5 text-[#52525B]">
                  Gia san pham trong database dang co phan le. He thong da goi y so
                  luong {suggestedQuantity} de tong tien la so nguyen VND ma PayOS chap nhan.
                </p>
              ) : null}
            </section>

            <section className="border-t pt-6">
              <h2 className="text-lg font-semibold text-[#151515]">Thong tin giao hang</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Ho va ten" name="shippingName" defaultValue="Nguyen Van Test" />
                <Field label="So dien thoai" name="shippingPhone" defaultValue="0901234567" />
                <Field
                  label="Dia chi"
                  name="shippingAddressLine1"
                  defaultValue="123 Nguyen Hue"
                  required
                />
                <Field
                  label="Quan / Huyen"
                  name="shippingDistrict"
                  defaultValue="Quan 1"
                />
                <Field
                  label="Tinh / Thanh pho"
                  name="shippingCity"
                  defaultValue="Ho Chi Minh"
                  required
                />
                <Field label="Ghi chu" name="notes" defaultValue="Thanh toan thu QR" />
              </div>
            </section>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={
                isLoadingProducts ||
                isSubmitting ||
                order?.status === "PENDING" ||
                !selectedProduct ||
                !hasWholeVndTotal
              }
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <QrCode size={18} />
              )}
              {isSubmitting ? "Dang tao QR..." : "Tao ma QR thanh toan"}
            </Button>
          </form>

          <aside className="h-fit rounded-2xl border border-[#151515]/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#151515]">Thanh toan</h2>
            <div className="mt-5 space-y-3 border-b pb-5 text-sm">
              <Summary label="San pham" value={selectedProduct?.name ?? "-"} />
              <Summary label="So luong" value={String(formValues.quantity)} />
              <Summary label="Tong cong" value={formatVnd(roundMoney(total))} strong />
            </div>

            {!paymentLink ? (
              <div className="py-12 text-center text-sm text-[#52525B]">
                <QrCode className="mx-auto mb-3 text-[#063C28]" size={36} />
                QR se hien tai day sau khi tao thanh toan.
              </div>
            ) : (
              <div className="pt-5 text-center">
                {qrImage ? (
                  <Image
                    src={qrImage}
                    alt="VietQR thanh toan PayOS"
                    width={260}
                    height={260}
                    unoptimized
                    className="mx-auto h-[260px] w-[260px]"
                  />
                ) : (
                  <Loader2 className="mx-auto my-20 animate-spin text-[#063C28]" />
                )}
                <p className="mt-3 text-sm font-semibold text-[#151515]">
                  {paymentLink.accountName}
                </p>
                <p className="text-sm text-[#52525B]">
                  {paymentLink.accountNumber} - BIN {paymentLink.bin}
                </p>
                <p className="mt-3 text-xl font-bold text-[#063C28]">
                  {formatVnd(paymentLink.amount)}
                </p>
                <p className="mt-1 text-xs text-[#52525B]">
                  Noi dung: {paymentLink.description}
                </p>
                <a
                  href={paymentLink.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 block rounded-full border border-[#063C28]/25 py-3 text-sm font-semibold text-[#063C28] transition-colors hover:border-[#3B9C3C]"
                >
                  Mo trang PayOS
                </a>
              </div>
            )}

            {order?.status === "PENDING" ? (
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-red-600 disabled:opacity-60"
              >
                {isCancelling ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <XCircle size={15} />
                )}
                Huy don test va tra ton kho
              </button>
            ) : null}

            {order?.status === "CANCELLED" ? (
              <p className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 size={16} />
                Don test da huy, ton kho da duoc hoan lai.
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-[#151515]">
      {label}
      <input
        required={required}
        name={name}
        defaultValue={defaultValue}
        className={fieldClassName}
      />
    </label>
  );
}

function Summary({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-[#52525B]">{label}</span>
      <span className="text-right text-[#151515]">{value}</span>
    </div>
  );
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getPayOSQuantity(product: Product) {
  const cents = Math.round(product.price * 100) % 100;
  if (cents === 0) {
    return 1;
  }

  const quantity = 100 / greatestCommonDivisor(cents, 100);
  return quantity <= product.stock ? quantity : null;
}

function greatestCommonDivisor(left: number, right: number): number {
  return right === 0 ? left : greatestCommonDivisor(right, left % right);
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 2,
  }).format(value);
}
