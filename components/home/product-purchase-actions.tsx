"use client";

import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { addCartItem } from "@/lib/api/cart";
import { PriceView } from "@/components/home/price-view";
import type { HomeProduct } from "@/lib/mock/home";
import { notifyCartUpdated } from "@/lib/store-events";
import { cn } from "@/lib/cn";

type Variation = NonNullable<HomeProduct["variations"]>[number];
type VariationOption = Variation["options"][number];

export function ProductPurchaseActions({ product }: { product: HomeProduct }) {
  const router = useRouter();
  const variations = useMemo(
    () =>
      (product.variations ?? []).filter((variation) => variation.isActive),
    [product.variations],
  );
  const optionGroups = useMemo(() => buildOptionGroups(variations), [variations]);
  const hasVariations = optionGroups.length > 0;
  const variationPriceRange = useMemo(
    () => getVariationPriceRange(variations),
    [variations],
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const hasSelectedEveryGroup = optionGroups.every(
    (group) => Boolean(selectedOptions[group.name]),
  );
  const selectedVariation = hasSelectedEveryGroup
    ? variations.find((variation) =>
        optionGroups.every((group) =>
          variation.options.some(
            (option) => option.id === selectedOptions[group.name],
          ),
        ),
      )
    : undefined;
  const canPurchase = hasVariations
    ? Boolean(selectedVariation && selectedVariation.stock > 0)
    : product.stock > 0;
  const availableStock = selectedVariation?.stock ?? (hasVariations ? 0 : product.stock);
  const checkoutHref = selectedVariation
    ? `/checkout?productId=${encodeURIComponent(product.id)}&variationId=${encodeURIComponent(selectedVariation.id)}&quantity=${quantity}`
    : `/checkout?productId=${encodeURIComponent(product.id)}&quantity=${quantity}`;

  function selectOption(groupName: string, optionId: string) {
    const nextOptions = {
      ...selectedOptions,
      [groupName]: optionId,
    };
    const nextVariation = variations.find((variation) =>
      optionGroups.every((group) =>
        variation.options.some((option) => option.id === nextOptions[group.name]),
      ),
    );

    setSelectedOptions(nextOptions);
    if (nextVariation) {
      setQuantity((current) => Math.min(current, Math.max(nextVariation.stock, 1)));
    }
  }

  async function handleAddToCart() {
    if (!canPurchase) {
      toast.error("Please select all product options first.");
      return;
    }

    setIsAdding(true);
    try {
      await addCartItem(product.id, quantity, selectedVariation?.id);
      notifyCartUpdated();
      toast.success(`${product.name} added to cart.`);
    } catch {
      router.push("/cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      {hasVariations ? (
        hasSelectedEveryGroup && selectedVariation ? (
          <div>
            <p className="text-2xl font-semibold text-red-600">
              {formatMoney(selectedVariation.price)}
            </p>
            <StockStatus stock={selectedVariation.stock} />
          </div>
        ) : (
          <div>
            <p className="text-2xl font-semibold text-red-600">
              {variationPriceRange}
            </p>
            <p className="mt-2 text-sm text-[#52525B]">
              Select all options to see availability.
            </p>
          </div>
        )
      ) : (
        <div>
          <PriceView
            price={product.price}
            discount={product.discount}
            className="text-2xl"
            priceClassName="font-semibold text-red-600"
          />
          <StockStatus stock={product.stock} />
        </div>
      )}

      {hasVariations ? (
        <>
          <div className="space-y-5">
            {optionGroups.map((group) => (
              <div key={group.name}>
                <p className="mb-3 text-sm font-semibold text-[#151515]">
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isSelected =
                      selectedOptions[group.name] === option.id;
                    const colorCode = getColorCode(option);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectOption(group.name, option.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
                          isSelected
                            ? "border-[#3B9C3C] bg-[#EAF7EF] text-[#063C28]"
                            : "border-[#151515]/15 text-[#151515] hover:border-[#3B9C3C]",
                        )}
                      >
                        {colorCode ? (
                          <span
                            aria-hidden="true"
                            className="h-4 w-4 rounded-full border border-[#151515]/20"
                            style={{ backgroundColor: colorCode }}
                          />
                        ) : null}
                        {getOptionValue(option)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasSelectedEveryGroup ? (
            !selectedVariation ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                This option combination is unavailable.
              </p>
            ) : null
          ) : null}
        </>
      ) : null}

      <div>
        <p className="mb-3 text-sm font-semibold text-[#151515]">Quantity</p>
        <div className="flex w-fit items-center rounded-full border border-[#151515]/15 p-1">
          <button
            type="button"
            disabled={!canPurchase || quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F6F6F6] disabled:opacity-40"
          >
            <Minus size={15} />
          </button>
          <span className="w-11 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            disabled={!canPurchase || quantity >= availableStock}
            onClick={() =>
              setQuantity((current) => Math.min(availableStock, current + 1))
            }
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F6F6F6] disabled:opacity-40"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {canPurchase ? (
          <Link
            href={checkoutHref}
            className="rounded-full bg-[#063C28] px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
          >
            Buy now
          </Link>
        ) : (
          <span className="rounded-full bg-[#063C28] px-8 py-3 text-center text-sm font-semibold text-white opacity-50">
            Buy now
          </span>
        )}
        <button
          type="button"
          disabled={!canPurchase || isAdding}
          onClick={() => void handleAddToCart()}
          className="rounded-full bg-[#063C28] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAdding ? (
            <Loader2 className="mr-2 inline-flex h-4 w-4 animate-spin" />
          ) : (
            <ShoppingBag className="mr-2 inline-flex h-4 w-4" />
          )}
          {isAdding ? "Adding..." : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function buildOptionGroups(variations: Variation[]) {
  const groups = new Map<string, Map<string, VariationOption>>();

  variations.forEach((variation) => {
    variation.options.forEach((option) => {
      const groupName = getOptionGroupName(option);
      const options = groups.get(groupName) ?? new Map<string, VariationOption>();

      options.set(option.id, option);
      groups.set(groupName, options);
    });
  });

  return Array.from(groups, ([name, options]) => ({
    name,
    options: Array.from(options.values()),
  }));
}

function getOptionGroupName(option: VariationOption) {
  return (
    Object.keys(option.attributes).find((key) => key.toLowerCase() !== "colorcode") ??
    option.name.split(" - ")[0] ??
    "Option"
  );
}

function getOptionValue(option: VariationOption) {
  const groupName = getOptionGroupName(option);
  const value = option.attributes[groupName];

  return typeof value === "string" && value.trim()
    ? value
    : option.name.split(" - ").slice(1).join(" - ") || option.name;
}

function getColorCode(option: VariationOption) {
  const colorCode = option.attributes.colorCode;
  return typeof colorCode === "string" && /^#[0-9A-Fa-f]{6}$/.test(colorCode)
    ? colorCode
    : "";
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function getVariationPriceRange(variations: Variation[]) {
  const prices = variations.map((variation) => variation.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice
    ? formatMoney(minPrice)
    : `${formatMoney(minPrice)} - ${formatMoney(maxPrice)}`;
}

function StockStatus({ stock }: { stock: number }) {
  return (
    <p
      className={cn(
        "mt-2 text-sm font-semibold",
        stock > 0 ? "text-[#063C28]" : "text-red-600",
      )}
    >
      {stock > 0 ? `${stock} in stock` : "Out of stock"}
    </p>
  );
}
