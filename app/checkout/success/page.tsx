import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="max-w-md rounded-2xl border bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-[#158947]" size={52} />
        <h1 className="mt-5 text-2xl font-bold text-[#151515]">Thanh toan thanh cong</h1>
        <p className="mt-3 text-sm leading-6 text-[#52525B]">
          PayOS da chuyen ban ve cua hang. Don hang se duoc cap nhat sau khi webhook
          xac nhan giao dich.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex rounded-full bg-[#063C28] px-7 py-3 text-sm font-semibold text-white"
        >
          Tiep tuc mua sam
        </Link>
      </div>
    </main>
  );
}
