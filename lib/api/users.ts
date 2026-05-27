import { apiRequest } from "@/lib/api/client";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/lib/types/user";

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
