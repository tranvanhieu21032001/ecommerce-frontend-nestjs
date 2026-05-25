"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api/auth";

export function GuestOnlyAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const user = await getCurrentUser();
        if (active) {
          router.replace(user.role === "ADMIN" ? "/dashboard" : "/");
        }
      } catch {
        if (active) {
          setIsGuest(true);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!isGuest) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-6 py-10">
        <p className="text-sm text-[color:var(--color-subtext)]">
          Checking your account...
        </p>
      </main>
    );
  }

  return children;
}
