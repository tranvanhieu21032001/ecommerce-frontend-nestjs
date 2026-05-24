import Image from "next/image";
import Link from "next/link";

import { categories } from "@/lib/mock/home";
import { Title } from "@/components/home/title";

export function HomeCategories() {
  return (
    <div className="my-10 rounded-md border border-[#3B9C3C]/20 bg-white p-5 md:my-20 lg:p-7">
      <Title className="border-b pb-3">Popular Categories</Title>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group flex items-center gap-3 bg-[#F6F6F6] p-5"
          >
            <div className="h-20 w-20 overflow-hidden border border-[#FB6C08]/30 p-1 transition-colors duration-300 hover:border-[#FB6C08]">
              <Link href="#products">
                <Image
                  src={category.image}
                  alt={category.title}
                  width={500}
                  height={500}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </Link>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{category.title}</h3>
              <p className="text-sm">
                <span className="font-bold text-[#063C28]">
                  ({category.productCount})
                </span>{" "}
                items Available
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
