import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getProducts } from "@/modules/catalog/actions/catalogActions";
import { SearchPageModule } from "@/modules/catalog/SearchPageModule";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    condition?: string;
    categoryId?: string;
    brandId?: string;
    vehicleModelId?: string;
  }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, page: pageStr, condition, categoryId, brandId, vehicleModelId } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const paged = await getProducts({
    q,
    page,
    pageSize: 24,
    condition: condition ?? null,
    categoryId: categoryId ?? null,
    brandId: brandId ?? null,
    vehicleModelId: vehicleModelId ?? null,
  });

  return (
    <>
      <Header />
      <CartDrawer />
      <SearchPageModule
        paged={paged}
        page={page}
        q={q}
        condition={condition}
        categoryId={categoryId}
        brandId={brandId}
        vehicleModelId={vehicleModelId}
        locale={locale}
      />
    </>
  );
}

export function generateMetadata() {
  return { title: "البحث | PartZone" };
}
