import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { PageBlockRenderer } from "@/modules/marketing/components/PageBlockRenderer";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <PageBlockRenderer locale={locale} />
      </main>
    </>
  );
}
