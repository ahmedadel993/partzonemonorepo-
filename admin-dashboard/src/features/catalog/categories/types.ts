export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  showInHome: boolean;
  showInMenu: boolean;
}
