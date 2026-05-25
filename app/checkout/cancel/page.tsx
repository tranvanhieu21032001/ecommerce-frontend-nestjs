import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="max-w-md rounded-2xl border bg-white p-10 text-center shadow-sm">
        <XCircle className="mx-auto text-red-500" size={52} />
        <h1 className="mt-5 text-2xl font-bold text-[#151515]">Da huy thanh toan</h1>
        <p className="mt-3 text-sm leading-6 text-[#52525B]">
          Giao dich PayOS chua duoc hoan tat. Ban co the quay lai checkout de thu lai.
        </p>
        <Link
          href="/checkout"
          className="mt-7 inline-flex rounded-full bg-[#063C28] px-7 py-3 text-sm font-semibold text-white"
        >
          Quay lai thanh toan
        </Link>
      </div>
    </main>
  );
}
