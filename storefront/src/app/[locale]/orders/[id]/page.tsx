import { notFound, redirect } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getCurrentUser } from "@/modules/auth/actions/authActions";
import { getOrderById, cancelOrder } from "@/modules/checkout/actions/checkoutActions";
import { OrderDetailPageModule } from "@/modules/checkout/OrderDetailPageModule";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ new?: string }>;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const { new: isNew } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/orders/${id}`);

  const order = await getOrderById(id);
  if (!order) notFound();

  const canCancel = order.status === "Pending" || order.status === "Confirmed";

  async function handleCancel() {
    "use server";
    await cancelOrder(id);
    redirect(`/${locale}/orders/${id}`);
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <OrderDetailPageModule
        order={order}
        locale={locale}
        isNew={isNew}
        canCancel={canCancel}
        handleCancel={handleCancel}
      />
    </>
  );
}
