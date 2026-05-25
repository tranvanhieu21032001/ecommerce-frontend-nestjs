import Image from "next/image";
import Link from "next/link";
import { Headset, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

import { Title } from "@/components/home/title";
import { brands } from "@/lib/mock/home";

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
  return (
    <div className="mb-10 rounded-md bg-[#F6F6F6] p-5 lg:mb-20 lg:p-7">
      <div className="mb-10 flex items-center justify-between gap-5">
        <Title>Shop By Brands</Title>
        <Link
          href="#products"
          className="text-sm font-semibold tracking-wide transition-colors duration-300 hover:text-[#063D29]"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-8">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href="#products"
            className="flex h-24 items-center justify-center overflow-hidden rounded-md bg-white shadow-[#063C28]/20 transition-all duration-300 hover:shadow-lg"
          >
            <Image
              src={brand.image}
              alt={brand.title}
              width={250}
              height={250}
              className="h-20 w-32 object-contain"
            />
          </Link>
        ))}
      </div>
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
