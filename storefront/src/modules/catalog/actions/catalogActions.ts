"use server";

import type {
  Brand,
  Category,
  ProductDetail,
  ProductFilter,
  PagedResult,
  ProductSummary,
  VehicleMake,
  VehicleModel,
} from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getBrands(): Promise<Brand[]> {
  return (await apiFetch<Brand[]>("/catalog/brands")) ?? [];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return apiFetch<Brand>(`/catalog/brands/${slug}`);
}

export async function getCategories(): Promise<Category[]> {
  return (await apiFetch<Category[]>("/catalog/categories")) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return apiFetch<Category>(`/catalog/categories/${slug}`);
}

export async function getProducts(filter: ProductFilter): Promise<PagedResult<ProductSummary>> {
  const params = new URLSearchParams();
  if (filter.q)             params.set("q", filter.q);
  if (filter.categoryId)    params.set("categoryId", filter.categoryId);
  if (filter.brandId)       params.set("brandId", filter.brandId);
  if (filter.condition)     params.set("condition", filter.condition);
  if (filter.vehicleModelId) params.set("vehicleModelId", filter.vehicleModelId);
  if (filter.page)          params.set("page", String(filter.page));
  if (filter.pageSize)      params.set("pageSize", String(filter.pageSize));

  return (await apiFetch<PagedResult<ProductSummary>>(`/catalog/products?${params.toString()}`)) ?? {
    items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return apiFetch<ProductDetail>(`/catalog/products/${slug}`);
}

export async function getVehicleMakes(): Promise<VehicleMake[]> {
  return (await apiFetch<VehicleMake[]>("/catalog/vehicle-makes")) ?? [];
}

export async function getVehicleModelsByMake(makeId: string): Promise<VehicleModel[]> {
  return (await apiFetch<VehicleModel[]>(`/catalog/vehicle-makes/${makeId}/models`)) ?? [];
}
