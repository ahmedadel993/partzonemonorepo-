import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { getCategoryBySlug, getProducts } from "@/modules/catalog/actions/catalogActions";
import { CategoryPageModule } from "@/modules/catalog/CategoryPageModule";
import { VehicleBanner } from "@/shared/ui/VehicleBanner";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; condition?: string; vehicleModelId?: string; makeName?: string; modelName?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { page: pageStr, condition, vehicleModelId, makeName, modelName } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const paged = await getProducts({
    categoryId: category.id,
    condition,
    page,
    pageSize: 24,
    vehicleModelId: vehicleModelId ?? null,
  });

  return (
    <>
      <Header />
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <Suspense fallback={null}>
          <VehicleBanner />
        </Suspense>
      </div>
      <CategoryPageModule
        category={category}
        paged={paged}
        page={page}
        condition={condition}
        vehicleModelId={vehicleModelId}
        makeName={makeName}
        modelName={modelName}
        locale={locale}
      />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category ? `${category.name} | PartZone` : "فئة",
  };
}
