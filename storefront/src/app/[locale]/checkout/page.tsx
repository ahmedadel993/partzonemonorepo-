import { redirect } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getCurrentUser } from "@/modules/auth/actions/authActions";
import { getMyAddresses } from "@/modules/checkout/actions/checkoutActions";
import { CheckoutForm } from "@/modules/checkout/components/CheckoutForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/checkout`)}`);
  }

  const addresses = await getMyAddresses();

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text mb-8">إتمام الطلب</h1>
        <CheckoutForm addresses={addresses} />
      </main>
    </>
  );
}

export async function generateMetadata() {
  return { title: "إتمام الطلب | PartZone" };
}
