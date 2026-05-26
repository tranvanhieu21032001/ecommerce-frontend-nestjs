"use client";

import { Heart, Loader2, LockKeyhole, Package, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

import { ShopContainer } from "@/components/home/shop-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import {
  changeCurrentPassword,
  updateCurrentProfile,
  type User,
} from "@/lib/api/users";
import { notifyProfileUpdated } from "@/lib/store-events";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthday: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function AccountPageContent() {
  const [user, setUser] = useState<AuthUser | User | null>(null);
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [password, setPassword] = useState<PasswordForm>(emptyPasswordForm);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const currentUser = await getCurrentUser();
        if (active) {
          setUser(currentUser);
          setProfile(toProfileForm(currentUser));
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load your account.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    const errors: Record<string, string> = {};
    if (!profile.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setIsSavingProfile(true);
    try {
      const updatedUser = await updateCurrentProfile({
        email: profile.email.trim(),
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phoneNumber: profile.phoneNumber.trim() || null,
        birthday: profile.birthday || null,
      });
      setUser(updatedUser);
      setProfile(toProfileForm(updatedUser));
      notifyProfileUpdated();
      toast.success("Account information updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update your account.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Record<string, string> = {};

    if (!password.currentPassword) {
      errors.currentPassword = "Enter your current password.";
    }
    if (!password.newPassword) {
      errors.newPassword = "Enter a new password.";
    } else if (password.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(
        password.newPassword,
      )
    ) {
      errors.newPassword =
        "Use uppercase, lowercase, a number and a special character.";
    }
    if (password.newPassword !== password.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsChangingPassword(true);
    try {
      await changeCurrentPassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword(emptyPasswordForm);
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not change your password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <ShopContainer className="py-16">
        <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-[#52525B]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your account...
        </div>
      </ShopContainer>
    );
  }

  if (!profile || !user) {
    return (
      <ShopContainer className="py-16">
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-[#52525B]">
          {loadError || "Could not load your account."}
        </div>
      </ShopContainer>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email;
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    user.email[0].toUpperCase();

  return (
    <div className="bg-[#FAFAFA] pb-12">
      <ShopContainer className="py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#3B9C3C]">
            Your account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#151515]">
            Manage account
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#151515]/10 bg-white p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#063C28] text-2xl font-semibold text-white">
                {initials}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#151515]">
                {displayName}
              </h2>
              <p className="mt-1 truncate text-sm text-[#52525B]">{user.email}</p>
              <span className="mt-4 inline-flex rounded-full bg-[#EAF7EC] px-3 py-1 text-xs font-semibold text-[#063C28]">
                {user.role === "ADMIN" ? "Administrator" : "Customer"}
              </span>
            </div>

            <nav className="overflow-hidden rounded-2xl border border-[#151515]/10 bg-white">
              <AccountShortcut href="/orders" icon={<Package />} label="My orders" />
              <AccountShortcut href="/wishlist" icon={<Heart />} label="Wishlist" />
              <AccountShortcut href="/cart" icon={<ShoppingBag />} label="Shopping cart" />
            </nav>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-[#151515]/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-[#063C28]" />
                <div>
                  <h2 className="text-lg font-semibold text-[#151515]">
                    Personal information
                  </h2>
                  <p className="text-sm text-[#52525B]">
                    Update your contact and basic account details.
                  </p>
                </div>
              </div>
              <form
                className="mt-6 grid gap-x-4 sm:grid-cols-2"
                onSubmit={handleProfileSubmit}
              >
                <Input
                  label="First name"
                  value={profile.firstName}
                  onChange={(event) =>
                    setProfile((current) =>
                      current ? { ...current, firstName: event.target.value } : current,
                    )
                  }
                />
                <Input
                  label="Last name"
                  value={profile.lastName}
                  onChange={(event) =>
                    setProfile((current) =>
                      current ? { ...current, lastName: event.target.value } : current,
                    )
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  error={profileErrors.email}
                  isRequired
                  onChange={(event) =>
                    setProfile((current) =>
                      current ? { ...current, email: event.target.value } : current,
                    )
                  }
                />
                <Input
                  label="Phone number"
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(event) =>
                    setProfile((current) =>
                      current ? { ...current, phoneNumber: event.target.value } : current,
                    )
                  }
                />
                <Input
                  label="Birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(event) =>
                    setProfile((current) =>
                      current ? { ...current, birthday: event.target.value } : current,
                    )
                  }
                />
                <div className="flex items-end pb-4 sm:justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSavingProfile}
                    className="sm:max-w-[170px]"
                  >
                    {isSavingProfile ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-[#151515]/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-[#063C28]" />
                <div>
                  <h2 className="text-lg font-semibold text-[#151515]">
                    Change password
                  </h2>
                  <p className="text-sm text-[#52525B]">
                    Use a strong password to protect your account.
                  </p>
                </div>
              </div>
              <form
                className="mt-6 grid gap-x-4 sm:grid-cols-2"
                onSubmit={handlePasswordSubmit}
              >
                <div className="sm:col-span-2">
                  <Input
                    label="Current password"
                    type="password"
                    showPasswordToggle
                    value={password.currentPassword}
                    error={passwordErrors.currentPassword}
                    isRequired
                    onChange={(event) =>
                      setPassword((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <Input
                  label="New password"
                  type="password"
                  showPasswordToggle
                  value={password.newPassword}
                  error={passwordErrors.newPassword}
                  isRequired
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  showPasswordToggle
                  value={password.confirmPassword}
                  error={passwordErrors.confirmPassword}
                  isRequired
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
                <div className="sm:col-span-2 sm:flex sm:justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isChangingPassword}
                    className="sm:max-w-[180px]"
                  >
                    {isChangingPassword ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </ShopContainer>
    </div>
  );
}

function AccountShortcut({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4 text-sm font-semibold text-[#52525B] transition-colors last:border-b-0 hover:bg-[#F0FDF4] hover:text-[#063C28]"
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </Link>
  );
}

function toProfileForm(user: AuthUser | User): ProfileForm {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phoneNumber: user.phoneNumber ?? "",
    birthday: user.birthday?.slice(0, 10) ?? "",
  };
}
