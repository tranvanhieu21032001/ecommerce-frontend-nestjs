import { AuthForm } from "@/components/auth/auth-form";
import { GuestOnlyAuth } from "@/components/auth/guest-only-auth";

export default function LoginPage() {
  return (
    <GuestOnlyAuth>
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-6 py-10">
        <AuthForm mode="login" />
      </main>
    </GuestOnlyAuth>
  );
}
