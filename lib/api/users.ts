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
