import type { Metadata } from "next";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { CategoriesPageModule } from "@/modules/catalog/CategoriesPageModule";
import { getCategories } from "@/modules/catalog/actions/catalogActions";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "الفئات | PartZone" };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const categories = await getCategories();

  return (
    <>
      <Header />
      <CartDrawer />
      <CategoriesPageModule categories={categories} locale={locale} />
    </>
  );
}
