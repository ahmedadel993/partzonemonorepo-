import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { getProductBySlug } from "@/modules/catalog/actions/catalogActions";
import { ProductPageModule } from "@/modules/catalog/ProductPageModule";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isPublished) notFound();

  return (
    <>
      <Header />
      <ProductPageModule product={product} locale={locale} />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} | PartZone` : "منتج",
    description: product?.description ?? undefined,
  };
}
