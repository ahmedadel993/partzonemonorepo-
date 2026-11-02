import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { redirect } from "next/navigation";
import { getCurrentUser, cancelOrder } from "@/modules/auth/actions/authActions";
import { getOrderById } from "@/modules/checkout/actions/checkoutActions";

const STATUS_LABELS: Record<string, string> = {
  Pending: "قيد المراجعة",
  Confirmed: "تم التأكيد",
  Shipped: "في الطريق إليك",
  Delivered: "تم التوصيل",
  Cancelled: "ملغي",
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-warning/15 text-warning",
  Confirmed: "bg-success/15 text-success",
  Shipped: "bg-accent/15 text-accent",
  Delivered: "bg-success/20 text-success",
  Cancelled: "bg-danger/15 text-danger",
};

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function OrderPage({ params }: Props) {
  const { locale, id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const order = await getOrderById(id);
  if (!order) notFound();

  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusColor = STATUS_COLORS[order.status] ?? "bg-surface-alt text-text-muted";
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
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="bg-surface-alt rounded-xl p-6 border border-border mb-8 text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h1 className="text-xl font-bold text-text">شكراً لطلبك!</h1>
          <p className="text-sm text-text-muted">
            رقم الطلب:{" "}
            <span className="font-mono font-semibold text-text" dir="ltr">{order.orderNumber}</span>
          </p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-text">المنتجات</h2>
            <ul className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-4">
                  {item.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded shrink-0" />
                    : <div className="w-14 h-14 bg-surface-alt rounded shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text line-clamp-1">{item.name}</p>
                    <p className="text-xs text-text-muted font-mono mt-0.5" dir="ltr">{item.sku} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-text shrink-0" dir="ltr">{item.subTotal.toFixed(2)} ج.م</span>
                </li>
              ))}
            </ul>

            {/* Shipping address */}
            <div className="border border-border rounded-xl p-4 space-y-1">
              <h2 className="text-sm font-semibold text-text mb-2">عنوان الشحن</h2>
              <p className="text-sm text-text">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-text-muted">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `، ${order.shippingAddress.addressLine2}` : ""}</p>
              <p className="text-sm text-text-muted">{order.shippingAddress.city}، {order.shippingAddress.governorate} {order.shippingAddress.postalCode}</p>
              {order.shippingAddress.phone && <p className="text-sm text-text-muted" dir="ltr">{order.shippingAddress.phone}</p>}
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="bg-surface-alt rounded-xl p-5 space-y-4 border border-border lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-base font-semibold text-text">ملخص التكلفة</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">المجموع الفرعي</span>
                <span className="text-text" dir="ltr">{order.subTotal.toFixed(2)} ج.م</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>الخصم</span>
                  <span dir="ltr">- {order.discountAmount.toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">رسوم الشحن</span>
                <span className={order.shippingFee === 0 ? "text-success" : "text-text"}>
                  {order.shippingFee === 0 ? "مجاناً" : `${order.shippingFee.toFixed(2)} ج.م`}
                </span>
              </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-border font-semibold">
              <span className="text-text">الإجمالي</span>
              <span className="text-accent" dir="ltr">{order.total.toFixed(2)} ج.م</span>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs text-text-muted text-center">تتبع طلبي — قريباً</p>
              <Link href={`/${locale}`} className="w-full h-10 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-semibold rounded-lg transition-colors flex items-center justify-center">
                تسوق مجدداً
              </Link>
              {canCancel && (
                <form action={handleCancel}>
                  <button
                    type="submit"
                    className="w-full h-10 border border-danger/40 text-danger hover:bg-danger/5 text-sm font-medium rounded-lg transition-colors"
                  >
                    إلغاء الطلب
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
