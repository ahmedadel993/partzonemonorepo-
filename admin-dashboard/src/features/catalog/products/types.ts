export interface ProductSummary {
  id: string;
  sku: string;
  slug: string;
  name: string;
  condition: string;
  priceAmount: number;
  priceCurrency: string;
  stock: number;
  isPublished: boolean;
  primaryImageUrl: string | null;
  brandName: string;
  categoryName: string;
  brandId: string;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isOnSale: boolean;
}

export interface PagedResult {
  items: ProductSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductDetail {
  id: string;
  sku: string;
  slug: string;
  name: string;
  condition: string;
  priceAmount: number;
  priceCurrency: string;
  stock: number;
  isPublished: boolean;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  images: { url: string; isPrimary: boolean }[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isOnSale: boolean;
}
