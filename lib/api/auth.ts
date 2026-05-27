import { apiRequest } from "@/lib/api/client";
import type {
  AuthResponse,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
} from "@/lib/types/auth";
import type { UserProfile } from "@/lib/types/user";

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

export async function googleLogin(payload: GoogleLoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/v1/auth/google", {
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

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await apiRequest<{ status: boolean; message: string; user: UserProfile }>(
    "/api/v1/auth/me",
    { method: "GET" },
  );

  return response.user;
}
