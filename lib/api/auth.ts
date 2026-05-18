const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8800";

const AUTH_STORAGE_KEY = "the-hole.auth";

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
  role: string;
};

export type AuthResponse = {
  status: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return "Request failed. Please try again.";
  }

  const message = (data as { message?: unknown }).message;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === "string").join(", ");
  }

  return "Request failed. Please try again.";
}

function persistSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function request<TResponse>(
  path: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data as TResponse;
}

export function getStoredAuth(): AuthSession | null {
  return readSession();
}

export function clearStoredAuth() {
  clearSession();
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/v1/auth/login", payload);
  persistSession({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  });
  return response;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/v1/auth/register", {
    email: payload.email,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
    birthday: payload.birthday,
  });

  persistSession({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  });

  return response;
}

export async function logout(): Promise<{ status: boolean; message: string }> {
  const session = readSession();
  if (!session?.refreshToken) {
    clearSession();
    return { status: true, message: "Logged out" };
  }

  try {
    const response = await request<{ status: boolean; message: string }>(
      "/api/v1/auth/logout",
      { refreshToken: session.refreshToken },
    );
    return response;
  } finally {
    clearSession();
  }
}
