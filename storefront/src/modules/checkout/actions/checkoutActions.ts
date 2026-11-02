"use server";

import { getAuthHeaders, getMyAddresses as getAddresses, addAddress as addAddr } from "@/modules/auth/actions/authActions";
import type { PlaceOrderInput, OrderConfirmation, OrderSummary, OrderDetail } from "@/modules/checkout/types";
import type { Address } from "@/modules/auth/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function placeOrder(
  input: PlaceOrderInput & { items: { productId: string; sku: string; name: string; unitPrice: number; quantity: number; imageUrl?: string | null }[] }
): Promise<OrderConfirmation | { error: string }> {
  const headers = await getAuthHeaders();
  if (!("Authorization" in headers)) return { error: "يجب تسجيل الدخول أولاً" };

  try {
    const res = await fetch(`${API}/checkout/place-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { error: text || "فشل تأكيد الطلب" };
    }

    return res.json() as Promise<OrderConfirmation>;
  } catch {
    return { error: "فشل الاتصال بالخادم" };
  }
}

export async function getMyOrders(): Promise<OrderSummary[]> {
  const headers = await getAuthHeaders();
  if (!("Authorization" in headers)) return [];

  try {
    const res = await fetch(`${API}/checkout/my-orders`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const headers = await getAuthHeaders();
  if (!("Authorization" in headers)) return null;

  try {
    const res = await fetch(`${API}/checkout/my-orders/${id}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export { getAddresses as getMyAddresses, addAddr as addAddress };
export type { Address };
