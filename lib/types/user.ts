export type UserRole = "USER" | "ADMIN" | (string & {});

export type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  birthday: string | null;
  phoneNumber: string | null;
  role: UserRole;
};

export type User = UserProfile & {
  createdAt: string;
  updatedAt: string;
};

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
