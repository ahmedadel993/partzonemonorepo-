import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getCurrentUser } from "@/modules/auth/actions/authActions";
import { getMyAddresses, getActivePaymentMethods } from "@/modules/checkout/actions/checkoutActions";
import { CheckoutForm } from "@/modules/checkout/components/CheckoutForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/checkout`)}`);
  }

  // Phase 6 – load addresses and payment methods in parallel
  const [addresses, paymentMethods] = await Promise.all([
    getMyAddresses(),
    getActivePaymentMethods(),
  ]);

  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text mb-8">{t("title")}</h1>
        <CheckoutForm addresses={addresses} paymentMethods={paymentMethods} />
      </main>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: `${t("title")} | PartZone` };
}
