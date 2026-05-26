import { apiRequest } from "@/lib/api/client";

export type UserRole = "USER" | "ADMIN" | string;

export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  birthday: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export async function getUsers(): Promise<User[]> {
  return apiRequest<User[]>("/api/v1/users");
}

export async function getUser(id: string): Promise<User> {
  return apiRequest<User>(`/api/v1/users/${id}`);
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/users/${id}`, {
    method: "DELETE",
  });
}

export type UpdateProfilePayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  birthday?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function updateCurrentProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  return apiRequest<User>("/api/v1/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export async function changeCurrentPassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/v1/users/me/password", {
    method: "PATCH",
    body: payload,
  });
}
