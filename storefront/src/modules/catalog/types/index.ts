export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  children: Category[];
}

export interface ProductSummary {
  id: string;
  sku: string;
  slug: string;
  name: string;
  condition: "Original" | "Aftermarket" | "Used";
  priceAmount: number;
  priceCurrency: string;
  stock: number;
  isPublished: boolean;
  primaryImageUrl: string | null;
  brandName: string;
  categoryName: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export interface ProductFitment {
  id: string;
  modelId: string;
  modelName: string;
  yearFrom: number;
  yearTo: number;
}

export interface ProductDetail {
  id: string;
  sku: string;
  oemNumber: string;
  slug: string;
  name: string;
  description: string | null;
  condition: "Original" | "Aftermarket" | "Used";
  priceAmount: number;
  priceCurrency: string;
  stock: number;
  isPublished: boolean;
  avgRating: number;
  reviewCount: number;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  fitments: ProductFitment[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilter {
  q?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  condition?: string | null;
  vehicleModelId?: string | null;
  page?: number;
  pageSize?: number;
}

export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface VehicleModel {
  id: string;
  name: string;
  slug: string;
  vehicleMakeId: string;
}
