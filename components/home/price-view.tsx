import { cn } from "@/lib/cn";

export function PriceView({
  price,
  discount,
  className,
  priceClassName,
}: {
  price: number;
  discount?: number;
  className?: string;
  priceClassName?: string;
}) {
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className={cn("font-bold text-[#063C28]", priceClassName)}>
        ${discountedPrice.toFixed(2)}
      </span>
      {discount ? (
        <>
          <span className="text-[#52525B] line-through">
            ${price.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-[#FB6C08]">
            -{discount}%
          </span>
        </>
      ) : null}
    </div>
  );
}
