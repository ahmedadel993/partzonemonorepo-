import type { Metadata } from "next";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { BrandsPageModule } from "@/modules/catalog/BrandsPageModule";
import { getBrands } from "@/modules/catalog/actions/catalogActions";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "الماركات | PartZone" };
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  const brands = await getBrands();

  return (
    <>
      <Header />
      <CartDrawer />
      <BrandsPageModule brands={brands} locale={locale} />
    </>
  );
}
