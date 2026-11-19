import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { getBrandBySlug, getProducts } from "@/modules/catalog/actions/catalogActions";
import { BrandPageModule } from "@/modules/catalog/BrandPageModule";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; condition?: string }>;
};

export default async function BrandPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { page: pageStr, condition } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const paged = await getProducts({ brandId: brand.id, condition, page, pageSize: 24 });

  return (
    <>
      <Header />
      <BrandPageModule brand={brand} paged={paged} page={page} condition={condition} locale={locale} />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return {
    title: brand ? `${brand.name} | PartZone` : "ماركة",
  };
}
