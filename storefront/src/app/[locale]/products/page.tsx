import type { Metadata } from "next";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { ProductsPageModule } from "@/modules/catalog/ProductsPageModule";
import {
  getBrands,
  getCategories,
  getProducts,
} from "@/modules/catalog/actions/catalogActions";
import type { ProductFilter } from "@/modules/catalog/types";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "المنتجات | PartZone" };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const filters: ProductFilter = {
    page,
    pageSize: 24,
    ...(sp.brandId    && { brandId:    sp.brandId }),
    ...(sp.categoryId && { categoryId: sp.categoryId }),
    ...(sp.condition  && { condition:  sp.condition }),
    ...(sp.q          && { q:          sp.q }),
    ...(sp.isFeatured  === "true" && { isFeatured:  true }),
    ...(sp.isBestSeller === "true" && { isBestSeller: true }),
    ...(sp.isNew       === "true" && { isNew:       true }),
    ...(sp.isOnSale    === "true" && { isOnSale:    true }),
  };

  const [paged, brands, categories] = await Promise.all([
    getProducts(filters),
    getBrands(),
    getCategories(),
  ]);

  return (
    <>
      <Header />
      <CartDrawer />
      <ProductsPageModule
        paged={paged}
        brands={brands}
        categories={categories}
        page={page}
        filters={{
          brandId:    sp.brandId,
          categoryId: sp.categoryId,
          condition:  sp.condition,
          q:          sp.q,
        }}
        locale={locale}
      />
    </>
  );
}
