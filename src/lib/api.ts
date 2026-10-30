// Small fetch wrapper for client components.
export async function api<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed with status ${res.status}`,
    );
  }
  return data as T;
}

export type Role = "customer" | "staff" | "admin" | "maintenance";

export interface SessionUser {
  id?: number;
  userId: number;
  role: Role;
  name: string;
  email: string;
}
