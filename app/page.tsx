"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-6 py-10">
      <section className="w-full max-w-xl rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-subtext)]">
          The Hole
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#1B3268]">
          {isLoading
            ? "Loading..."
            : user
              ? "You are signed in"
              : "Auth UI Demo"}
        </h1>
        <p className="mt-2 text-[color:var(--color-subtext)]">
          {isLoading
            ? "Checking your session..."
            : user
              ? `Logged in as ${user.email}`
              : "Choose where you want to go next."}
        </p>

        {user ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user.role === "ADMIN" ? (
              <Button
                variant="primary"
                className="sm:flex-1"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                variant="primary"
                className="sm:flex-1"
                onClick={() => router.push("/")}
              >
                Go to Home
              </Button>
            )}
            <Button
              variant="danger"
              className="sm:flex-1"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              className="sm:flex-1"
              onClick={() => router.push("/login")}
            >
              Go to Sign In
            </Button>
            <Button
              variant="default"
              className="sm:flex-1"
              onClick={() => router.push("/register")}
            >
              Go to Sign Up
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
