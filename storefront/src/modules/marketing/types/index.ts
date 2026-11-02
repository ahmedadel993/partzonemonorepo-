export type PageBlockType =
  | "Hero"
  | "VehicleStrip"
  | "CategoryGrid"
  | "ProductList"
  | "BannerSingle"
  | "BannerDouble";

export interface PageBlockTranslation {
  locale: string;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  configOverride?: string | null;
}

export interface ActivePageBlock {
  id: string;
  type: PageBlockType;
  sortOrder: number;
  config: string;
  bindingType: string;
  targetId?: string | null;
  targetUrl?: string | null;
  translations: PageBlockTranslation[];
}

export interface CouponValidationResult {
  isValid: boolean;
  discountType?: string | null;
  value?: number | null;
  errorCode?: string | null;
}
