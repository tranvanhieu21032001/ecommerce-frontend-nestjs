"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const modeConfig = {
  login: {
    title: "Welcome back to The Hole!",
    subtitle: "Sign in to continue",
    submitLabel: "Login",
    submittingLabel: "Signing In...",
    successMessage: "Signed in successfully.",
    footerText: "Don't have an account?",
    footerLinkLabel: "Register",
    footerHref: "/register",
  },
  register: {
    title: "Create your The Hole account",
    subtitle: "Sign up to start shopping",
    submitLabel: "Register",
    submittingLabel: "Creating Account...",
    footerText: "Already have an account?",
    footerLinkLabel: "Login",
    footerHref: "/login",
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const config = modeConfig[mode];
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const nextErrors: Record<string, string> = {};
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const confirmPassword = String(
      formData.get("confirmPassword") ?? "",
    ).trim();

    if (mode === "register" && !firstName) {
      nextErrors.firstName = "First name is required.";
    }
    if (mode === "register" && !lastName) {
      nextErrors.lastName = "Last name is required.";
    }
    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (mode === "register" && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    } else if (
      mode === "register" &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(password)
    ) {
      nextErrors.password =
        "Password must include uppercase, lowercase, number, and special character.";
    }
    if (mode === "register" && !confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    }
    if (
      mode === "register" &&
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "register") {
        const response = await register({
          firstName,
          lastName,
          email,
          password,
        });
        router.replace(response.user.role === "ADMIN" ? "/dashboard" : "/");
      } else {
        const response = await login({ email, password });
        router.replace(response.user.role === "ADMIN" ? "/dashboard" : "/");
      }
      form.reset();
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid min-h-[680px] w-full max-w-[1080px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden bg-primary px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-xl bg-white">
            <Image
              src="/images/logo.png"
              alt="E-Com"
              width={36}
              height={36}
              priority
              className="h-[36px] w-[36px] object-contain"
            />
          </div>
          <span className="text-[20px] font-bold">The Hole</span>
        </div>

        <div className="max-w-[420px]">
          <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Flash sale ecommerce
          </p>
          <h2 className="mt-5 text-[46px] font-bold leading-[1.08]">
            Shop faster with your favorite deals in one place.
          </h2>
          <p className="mt-5 text-[16px] leading-7 text-white/72">
            Sign in to track orders, save products, and catch limited-time
            offers before they sell out.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-white/10 px-4 py-5">
            <p className="text-[22px] font-bold">24h</p>
            <p className="mt-1 text-[12px] text-white/70">Fast deals</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-5">
            <p className="text-[22px] font-bold">1K+</p>
            <p className="mt-1 text-[12px] text-white/70">Products</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-5">
            <p className="text-[22px] font-bold">5%</p>
            <p className="mt-1 text-[12px] text-white/70">Daily drops</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[680px] flex-col items-center justify-center px-6 py-12 text-center lg:px-16">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-xl">
          <Image
            src="/images/logo.png"
            alt="E-Com"
            width={36}
            height={36}
            priority
            className="h-[36px] w-[36px] object-contain"
          />
        </div>

        <div className="mt-6 space-y-1 lg:mt-0">
          <h1 className="text-[24px] font-bold leading-8 text-[#1B3268]">
            {config.title}
          </h1>
          <p className="text-[14px] leading-6 text-[color:var(--color-subtext)]">
            {config.subtitle}
          </p>
        </div>

        <form
          className="mt-10 flex w-full max-w-[440px] flex-col items-center"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="flex w-full flex-col items-center gap-[10px]">
            {mode === "register" ? (
              <div className="grid w-full gap-[10px] sm:grid-cols-2">
                <Input
                  name="firstName"
                  placeholder="First Name"
                  autoComplete="given-name"
                  leadingIcon={<UserIcon />}
                  isRequired
                  error={errors.firstName}
                />
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  leadingIcon={<UserIcon />}
                  isRequired
                  error={errors.lastName}
                />
              </div>
            ) : null}

            <Input
              type="email"
              name="email"
              placeholder="Your Email / Phone Number"
              autoComplete="email"
              leadingIcon={<UserIcon />}
              isRequired
              error={errors.email}
            />

            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              leadingIcon={<LockIcon />}
              showPasswordToggle
              isRequired
              error={errors.password}
            />

            {mode === "register" ? (
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                autoComplete="new-password"
                leadingIcon={<LockIcon />}
                showPasswordToggle
                isRequired
                error={errors.confirmPassword}
              />
            ) : null}
          </div>

          {mode === "login" ? (
            <div className="mt-4 flex w-full items-center justify-between">
              <label className="flex items-center gap-[6px] text-[11px] text-[color:var(--color-subtext)]">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-[12px] w-[12px] rounded border-[#D1D5DB] accent-[#0B2C91]"
                />
                Remember Me
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#0B2C91]"
              >
                Forgot Password?
              </Link>
            </div>
          ) : null}

          {errors.form ? (
            <p className="mt-3 w-full rounded border border-[color:var(--color-danger)] bg-[#FFF1F2] px-3 py-2 text-left text-[11px] text-[color:var(--color-danger)]">
              {errors.form}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="mt-6 text-[14px] font-medium"
          >
            {isSubmitting ? config.submittingLabel : config.submitLabel}
          </Button>
        </form>

        <div className="mt-8 flex w-full max-w-[440px] items-center gap-5">
          <span className="h-px flex-1 bg-[#E5E7EB]" />
          <span className="text-[11px] font-bold text-[color:var(--color-subtext)]">
            OR
          </span>
          <span className="h-px flex-1 bg-[#E5E7EB]" />
        </div>

        <p className="mt-7 text-[12px] text-[#4B5563]">
          {mode === "login" ? "Login using" : "Register using"}
        </p>
        <div className="mt-4 flex items-center justify-center gap-[34px]">
          <button
            type="button"
            aria-label="Continue with Apple"
            className="text-black"
          >
            <AppleIcon />
          </button>
          <button type="button" aria-label="Continue with Facebook">
            <FacebookIcon />
          </button>
          <button type="button" aria-label="Continue with Google">
            <GoogleIcon />
          </button>
        </div>

        <div className="mt-10 text-center text-[11px] text-[color:var(--color-subtext)]">
          {config.footerText}{" "}
          <Link
            href={config.footerHref}
            className="font-bold text-[#0B2C91] hover:underline"
          >
            {config.footerLinkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="currentColor"
    >
      <path d="M18.7 14.8c0-3.1 2.5-4.6 2.6-4.7-1.4-2.1-3.7-2.4-4.5-2.4-1.9-.2-3.7 1.1-4.7 1.1s-2.5-1.1-4.1-1.1c-2.1 0-4 1.2-5.1 3.1-2.2 3.8-.6 9.5 1.6 12.6 1.1 1.5 2.3 3.2 4 3.1 1.6-.1 2.2-1 4.1-1s2.5 1 4.1 1c1.7 0 2.8-1.6 3.8-3.1 1.2-1.8 1.7-3.5 1.8-3.6-.1 0-3.6-1.4-3.6-5Z" />
      <path d="M15.6 5.7c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.8.9-3.7 1.9-.8.9-1.5 2.5-1.3 3.9 1.4.1 2.8-.7 3.7-1.7Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="12" fill="#4267B2" />
      <path
        d="M13.5 19v-6.3h2.1l.3-2.5h-2.4V8.6c0-.7.2-1.2 1.2-1.2H16V5.2c-.2 0-1-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v1.8H8.9v2.5H11V19h2.5Z"
        fill="white"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M23.5 12.8c0-.8-.1-1.5-.2-2.2H12.8v4.2h6a5.2 5.2 0 0 1-2.2 3.4v2.8h3.6c2.1-2 3.3-4.8 3.3-8.2Z"
        fill="#4285F4"
      />
      <path
        d="M12.8 23.5c3 0 5.6-1 7.4-2.6l-3.6-2.8c-1 .7-2.2 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.7H2.8v2.9a11.2 11.2 0 0 0 10 6.1Z"
        fill="#34A853"
      />
      <path
        d="M6.5 14.5a6.7 6.7 0 0 1 0-4.3V7.3H2.8a11.2 11.2 0 0 0 0 10.1l3.7-2.9Z"
        fill="#FBBC05"
      />
      <path
        d="M12.8 5.5c1.6 0 3.1.6 4.2 1.7l3.2-3.2A10.8 10.8 0 0 0 12.8 1a11.2 11.2 0 0 0-10 6.3l3.7 2.9c.9-2.7 3.4-4.7 6.3-4.7Z"
        fill="#EA4335"
      />
    </svg>
  );
}
