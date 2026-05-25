import { ShopFooter } from "@/components/home/shop-footer";
import { ShopHeader } from "@/components/home/shop-header";

export function ShopShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex min-h-screen flex-col bg-white text-[#151515]">
        <ShopHeader />
        <main className="flex-1">{children}</main>
        <ShopFooter />
      </div>
    </div>
  );
}
