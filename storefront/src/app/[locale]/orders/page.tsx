import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/modules/auth/actions/authActions";
import { getMyOrders } from "@/modules/checkout/actions/checkoutActions";

const STATUS_LABELS: Record<string, string> = {
  Pending:   "معلق",
  Confirmed: "مؤكد",
  Shipped:   "تم الشحن",
  Delivered: "تم التسليم",
  Cancelled: "ملغي",
};

const STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped:   "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/orders`);

  const orders = await getMyOrders();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-text">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <p className="text-text-muted text-lg">لا توجد طلبات بعد</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-accent text-accent-fg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            ابدأ التسوق
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="font-mono text-sm font-semibold text-text" dir="ltr">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-text-muted" dir="ltr">
                  {new Date(order.placedAt).toLocaleDateString("ar-EG")} · {order.itemCount} منتج
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-surface-alt text-text-muted"}`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <p className="font-semibold text-text text-sm" dir="ltr">
                  {order.total.toFixed(2)} ج.م
                </p>
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="text-sm text-accent hover:underline shrink-0"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
