import Image from "next/image";
import Link from "next/link";

export function HomeBanner() {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#FCF0E4] px-10 py-16 md:py-0 lg:px-24">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold leading-tight text-[#151515] md:text-4xl lg:text-5xl">
          Grab Upto 50% off on <br />
          Selected headphone
        </h1>
        <Link
          href="#products"
          className="inline-flex rounded-md bg-[#063C28]/90 px-5 py-2 text-sm font-semibold text-white/90 transition-colors duration-300 hover:bg-[#063C28] hover:text-white"
        >
          Buy Now
        </Link>
      </div>
      <Image
        src="/shopcartyt/images/banner/banner_1.png"
        alt="Headphone sale banner"
        width={480}
        height={360}
        priority
        className="hidden w-96 object-contain md:inline-flex"
      />
    </div>
  );
}
