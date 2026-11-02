"use server";

import { cookies } from "next/headers";
import type { Address, AuthUser } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function login(
  email: string,
  password: string
): Promise<{ user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`${API}/identity/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (!res.ok) return { error: "بيانات الدخول غير صحيحة" };
    const data = await res.json();

    const meRes = await fetch(`${API}/identity/me`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
      cache: "no-store",
    });
    const me = meRes.ok ? await meRes.json() : { id: data.userId, email, firstName: "", lastName: "", role: data.role };

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set("auth_user", JSON.stringify(me), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return { user: me as AuthUser };
  } catch {
    return { error: "حدث خطأ، يرجى المحاولة مجدداً" };
  }
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ error?: string }> {
  try {
    const res = await fetch(`${API}/identity/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { error: errText || "هذا البريد الإلكتروني مسجل بالفعل" };
    }
    const loginResult = await login(email, password);
    return loginResult.error ? { error: loginResult.error } : {};
  } catch {
    return { error: "حدث خطأ، يرجى المحاولة مجدداً" };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_user");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("auth_user")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyAddresses(): Promise<Address[]> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return [];
  try {
    const res = await fetch(`${API}/identity/me/addresses`, {
      headers,
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Address[]) : [];
  } catch {
    return [];
  }
}

export async function addAddress(
  input: Omit<Address, "id" | "userId">
): Promise<Address | null> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API}/identity/me/addresses`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Address) : null;
  } catch {
    return null;
  }
}
