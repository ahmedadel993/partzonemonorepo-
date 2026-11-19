import { Suspense } from "react";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getProducts, getCategories } from "@/modules/catalog/actions/catalogActions";
import { SearchPageModule } from "@/modules/catalog/SearchPageModule";
import { VehicleBanner } from "@/shared/ui/VehicleBanner";
import { VehicleCategoryStrip } from "@/modules/catalog/components/VehicleCategoryStrip";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    condition?: string;
    categoryId?: string;
    brandId?: string;
    vehicleModelId?: string;
    makeName?: string;
    modelName?: string;
  }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, page: pageStr, condition, categoryId, brandId, vehicleModelId, makeName, modelName } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const [paged, vehicleCategories] = await Promise.all([
    getProducts({
      q,
      page,
      pageSize: 24,
      condition: condition ?? null,
      categoryId: categoryId ?? null,
      brandId: brandId ?? null,
      vehicleModelId: vehicleModelId ?? null,
    }),
    vehicleModelId ? getCategories({ vehicleModelId }) : Promise.resolve([]),
  ]);

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        <Suspense fallback={null}>
          <VehicleBanner />
        </Suspense>
        {vehicleModelId && vehicleCategories.length > 0 && (
          <VehicleCategoryStrip
            categories={vehicleCategories}
            vehicleModelId={vehicleModelId}
            makeName={makeName}
            modelName={modelName}
            locale={locale}
          />
        )}
      </main>
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
