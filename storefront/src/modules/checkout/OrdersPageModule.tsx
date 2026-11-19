import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ORDER_STATUS_COLORS } from "@/modules/checkout/constants/orderStatus";
import type { OrderSummary } from "@/modules/checkout/types";

interface OrdersPageModuleProps {
  orders: OrderSummary[];
  locale: string;
}

export async function OrdersPageModule({ orders, locale }: OrdersPageModuleProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "orders" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const STATUS_LABELS: Record<string, string> = {
    Pending:   t("statusPending"),
    Confirmed: t("statusConfirmed"),
    Shipped:   t("statusShipped"),
    Delivered: t("statusDelivered"),
    Cancelled: t("statusCancelled"),
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-text">{t("title")}</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <p className="text-text-muted text-lg">{t("empty")}</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-accent text-accent-fg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            {t("startShopping")}
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
                  {new Date(order.placedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")} · {t("itemCount", { count: order.itemCount })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] ?? "bg-surface-alt text-text-muted"}`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <p className="font-semibold text-text text-sm" dir="ltr">
                  {order.total.toFixed(2)} {tCommon("currency")}
                </p>
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="text-sm text-accent hover:underline shrink-0"
                >
                  {t("viewDetails")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
