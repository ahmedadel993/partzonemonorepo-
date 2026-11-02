"use server";

import type { ActivePageBlock, CouponValidationResult } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getActivePageBlocks(): Promise<ActivePageBlock[]> {
  return (await apiFetch<ActivePageBlock[]>("/marketing/page-blocks")) ?? [];
}

export async function validateCoupon(
  code: string,
  orderAmount: number
): Promise<CouponValidationResult> {
  return (
    (await apiFetch<CouponValidationResult>(
      `/marketing/coupons/${encodeURIComponent(code)}/validate?orderAmount=${orderAmount}`
    )) ?? { isValid: false, errorCode: "FETCH_ERROR" }
  );
}
