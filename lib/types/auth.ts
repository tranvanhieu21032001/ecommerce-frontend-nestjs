import type { UserProfile } from "@/lib/types/user";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  birthday?: string;
};

export type GoogleLoginPayload = {
  credential: string;
};

export type AuthResponse = {
  status: boolean;
  message: string;
  user: UserProfile;
};
