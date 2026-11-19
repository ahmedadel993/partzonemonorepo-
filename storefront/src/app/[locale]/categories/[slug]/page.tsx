import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { getCategoryBySlug, getProducts } from "@/modules/catalog/actions/catalogActions";
import { CategoryPageModule } from "@/modules/catalog/CategoryPageModule";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; condition?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { page: pageStr, condition } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const paged = await getProducts({ categoryId: category.id, condition, page, pageSize: 24 });

  return (
    <>
      <Header />
      <CategoryPageModule category={category} paged={paged} page={page} condition={condition} locale={locale} />
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
