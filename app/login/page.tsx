import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-6 py-10">
      <AuthForm mode="login" />
    </main>
  );
}
