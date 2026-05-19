import { apiRequest } from "@/lib/api/client";

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

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  birthday: string | null;
  phoneNumber: string | null;
  role: "USER" | "ADMIN" | string;
};

export type AuthResponse = {
  status: boolean;
  message: string;
  user: AuthUser;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  });
}

export async function logout(): Promise<{ status: boolean; message: string }> {
  return apiRequest<{ status: boolean; message: string }>("/api/v1/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<{ status: boolean; message: string; user: AuthUser }>(
    "/api/v1/auth/me",
    { method: "GET" },
  );

  return response.user;
}
