import { useState, useEffect } from "react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  placedAt: string;
}

const API = import.meta.env.VITE_API_URL ?? "/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pz_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-warning/15 text-warning",
  Confirmed: "bg-accent/15 text-accent",
  Shipped:   "bg-sky-500/15 text-sky-500",
  Delivered: "bg-success/15 text-success",
  Cancelled: "bg-danger/15 text-danger",
};

const STATUS_LABELS: Record<string, string> = {
  Pending:   "معلق",
  Confirmed: "مؤكد",
  Shipped:   "تم الشحن",
  Delivered: "تم التسليم",
  Cancelled: "ملغي",
};

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-1">
      <p className="text-xs text-text-muted font-medium">{label}</p>
      <p className="text-2xl font-bold text-text">{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/orders`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total       = orders.length;
  const revenue     = orders.reduce((s, o) => s + o.total, 0);
  const pending     = orders.filter((o) => o.status === "Pending").length;
  const active      = orders.filter((o) => o.status === "Confirmed" || o.status === "Shipped").length;
  const recent      = [...orders].slice(0, 5);

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-semibold text-text">لوحة التحكم</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-alt animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="إجمالي الطلبات" value={total} />
          <KpiCard label="الإيرادات" value={`${revenue.toFixed(0)} ج.م`} />
          <KpiCard label="معلّقة" value={pending} sub="تحتاج متابعة" />
          <KpiCard label="نشطة" value={active} sub="مؤكدة + شحن" />
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-text mb-3">أحدث الطلبات</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface-alt animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-text-muted text-sm rounded-lg border border-dashed border-border">
            لا توجد طلبات بعد
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt border-b border-border">
                <tr>
                  <th className="text-right font-medium text-text-muted px-4 py-3">رقم الطلب</th>
                  <th className="text-right font-medium text-text-muted px-4 py-3">الحالة</th>
                  <th className="text-right font-medium text-text-muted px-4 py-3">الإجمالي</th>
                  <th className="text-right font-medium text-text-muted px-4 py-3">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-surface-alt text-text-muted"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text" dir="ltr">{order.total.toFixed(2)} ج.م</td>
                    <td className="px-4 py-3 text-text-muted" dir="ltr">
                      {new Date(order.placedAt).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
