"use server";

import { getAuthHeaders } from "@/modules/auth/actions/authActions";
import type { AddToCartInput, Cart } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getCart(): Promise<Cart | null> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API}/cart`, { headers, cache: "no-store" });
    return res.ok ? ((await res.json()) as Cart) : null;
  } catch {
    return null;
  }
}

export async function addToCart(input: AddToCartInput): Promise<Cart | null> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API}/cart/items`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Cart) : null;
  } catch {
    return null;
  }
}

export async function updateCartItemQty(
  itemId: string,
  quantity: number
): Promise<Cart | null> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API}/cart/items/${itemId}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Cart) : null;
  } catch {
    return null;
  }
}

export async function removeFromCart(itemId: string): Promise<Cart | null> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(`${API}/cart/items/${itemId}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Cart) : null;
  } catch {
    return null;
  }
}

export async function clearCart(): Promise<void> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return;
  try {
    await fetch(`${API}/cart`, { method: "DELETE", headers, cache: "no-store" });
  } catch {
    // silent
  }
}
