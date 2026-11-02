export type PageBlockType =
  | "Hero"
  | "VehicleStrip"
  | "CategoryGrid"
  | "ProductList"
  | "BannerSingle"
  | "BannerDouble";

export type BindingType =
  | "None"
  | "Category"
  | "Brand"
  | "Product"
  | "VehicleMake"
  | "VehicleModel"
  | "Url";

export type DiscountType = "FixedAmount" | "Percentage";

export interface PageBlockTranslation {
  locale: string;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  configOverride?: string | null;
}

export interface PageBlock {
  id: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  activeFrom?: string | null;
  activeTo?: string | null;
  config: string;
  bindingType: string;
  targetId?: string | null;
  targetUrl?: string | null;
  translations: PageBlockTranslation[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  value: number;
  minOrderAmount?: number | null;
  usageLimit: number;
  perUserLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface PageBlockPayload {
  pageBlock?: PageBlock | null;
  errors: string[];
}

export interface CouponPayload {
  coupon?: Coupon | null;
  errors: string[];
}
