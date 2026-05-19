export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8800";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: FormData | Record<string, unknown>;
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<void> | null = null;

export function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return "Request failed. Please try again.";
  }

  const message = (data as { message?: unknown }).message;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message
      .filter((item): item is string => typeof item === "string")
      .join(", ");
  }

  return "Request failed. Please try again.";
}

async function refreshAuthSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(getErrorMessage(data));
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const body = options.body;
  const isFormData = body instanceof FormData;
  const requestBody: BodyInit | undefined = isFormData
    ? body
    : body
      ? JSON.stringify(body)
      : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers:
      body && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: requestBody,
  });

  const data = await response.json().catch(() => null);

  if (response.ok) {
    return data as TResponse;
  }

  if (response.status === 401 && !options.skipAuthRefresh) {
    await refreshAuthSession();

    return apiRequest<TResponse>(path, {
      ...options,
      skipAuthRefresh: true,
    });
  }

  throw new Error(getErrorMessage(data));
}
