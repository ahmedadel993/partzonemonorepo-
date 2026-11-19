import { getTranslations } from "next-intl/server";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { CartPageClient } from "./CartPageClient";

type Props = { params: Promise<{ locale: string }> };

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text mb-8">{t("title")}</h1>
        <CartPageClient locale={locale} />
      </main>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: `${t("title")} | PartZone` };
}
