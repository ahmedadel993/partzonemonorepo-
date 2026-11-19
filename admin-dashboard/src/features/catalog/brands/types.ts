export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  showInHome: boolean;
  isSponsored: boolean;
}
