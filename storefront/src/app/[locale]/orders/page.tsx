import { redirect } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getCurrentUser } from "@/modules/auth/actions/authActions";
import { getMyOrders } from "@/modules/checkout/actions/checkoutActions";
import { OrdersPageModule } from "@/modules/checkout/OrdersPageModule";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/orders`);

  const orders = await getMyOrders();

  return (
    <>
      <Header />
      <CartDrawer />
      <OrdersPageModule orders={orders} locale={locale} />
    </>
  );
}
