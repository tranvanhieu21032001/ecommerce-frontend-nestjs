"use client";

import { useEffect, useState } from "react";

import { ShopNoAccess } from "@/components/home/shop-no-access";
import { getCurrentUser } from "@/lib/api/auth";

export function ProtectedShopContent({
  children,
  details,
}: {
  children: React.ReactNode;
  details?: string;
}) {
  const [authState, setAuthState] = useState<"loading" | "authorized" | "guest">(
    "loading",
  );

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        await getCurrentUser();
        if (active) {
          setAuthState("authorized");
        }
      } catch {
        if (active) {
          setAuthState("guest");
        }
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, []);

  if (authState === "loading") {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-sm text-[#52525B]">
        Checking your account...
      </div>
    );
  }

  if (authState === "guest") {
    return <ShopNoAccess details={details} />;
  }

  return children;
}
