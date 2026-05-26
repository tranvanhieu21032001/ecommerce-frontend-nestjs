"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Headset,
  ImageIcon,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Title } from "@/components/home/title";
import { getBrands, type Brand } from "@/lib/api/brands";

const extraData = [
  {
    title: "Free Delivery",
    description: "Free shipping over $100",
    icon: <Truck size={42} strokeWidth={1.4} />,
  },
  {
    title: "Free Return",
    description: "Free shipping over $100",
    icon: <RefreshCcw size={42} strokeWidth={1.4} />,
  },
  {
    title: "Customer Support",
    description: "Friendly 24/7 customer support",
    icon: <Headset size={42} strokeWidth={1.4} />,
  },
  {
    title: "Money Back guarantee",
    description: "Quality checked by our team",
    icon: <ShieldCheck size={42} strokeWidth={1.4} />,
  },
];

export function ShopByBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      try {
        const response = await getBrands({
          isActive: true,
          page: 1,
          limit: 8,
        });

        if (active) {
          setBrands(response.data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load brands.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadBrands();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mb-10 rounded-md bg-[#F6F6F6] p-5 lg:mb-20 lg:p-7">
      <div className="mb-10 flex items-center justify-between gap-5">
        <Title>Shop By Brands</Title>
        <Link
          href="/shop"
          className="text-sm font-semibold tracking-wide transition-colors duration-300 hover:text-[#063D29]"
        >
          View all
        </Link>
      </div>
      {isLoading ? (
        <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-[#52525B]">
          <Loader2 className="h-5 w-5 animate-spin text-[#063C28]" />
          Loading brands...
        </div>
      ) : brands.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brandId=${encodeURIComponent(brand.id)}`}
              aria-label={`Shop ${brand.name} products`}
              className="group flex h-24 flex-col items-center justify-center overflow-hidden rounded-md bg-white px-2 shadow-[#063C28]/20 transition-all duration-300 hover:shadow-lg"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={250}
                  height={250}
                  unoptimized
                  className="h-14 w-28 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <ImageIcon className="h-7 w-7 text-[#063C28]/35" />
              )}
              <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#52525B]">
                {brand.name}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-24 items-center justify-center text-sm text-[#52525B]">
          {error || "No brands available."}
        </div>
      )}
      <div className="mt-16 grid grid-cols-1 gap-4 p-2 py-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {extraData.map((item) => (
          <div
            key={item.title}
            className="group flex items-center gap-3 text-[#52525B] transition-colors duration-300 hover:text-[#3B9C3C]"
          >
            <span className="inline-flex scale-100 transition-transform duration-300 group-hover:scale-90">
              {item.icon}
            </span>
            <div className="text-sm">
              <p className="font-bold capitalize text-[#151515]/80">
                {item.title}
              </p>
              <p className="text-[#52525B]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
