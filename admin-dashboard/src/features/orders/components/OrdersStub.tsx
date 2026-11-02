import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderSummary {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  total: number;
  itemCount: number;
  placedAt: string;
}

interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  imageUrl: string | null;
}

interface OrderDetail extends OrderSummary {
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  couponCode: string | null;
  notes: string | null;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingGovernorate: string;
  shippingPostalCode: string;
  items: OrderItem[];
}

// ── API helpers ───────────────────────────────────────────────────────────────

const apiBase = import.meta.env.VITE_API_URL ?? "/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pz_access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function fetchOrders(): Promise<OrderSummary[]> {
  const res = await fetch(`${apiBase}/admin/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchOrderDetail(id: string): Promise<OrderDetail> {
  const res = await fetch(`${apiBase}/admin/orders/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function updateOrderStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${apiBase}/admin/orders/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

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

// ── Orders list ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-surface-alt text-text-muted";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// ── Order detail modal ────────────────────────────────────────────────────────

function OrderDetailModal({
  orderId,
  onClose,
  onStatusChanged,
}: {
  orderId: string;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchOrderDetail(orderId)
      .then((o) => { setOrder(o); setSelectedStatus(o.status); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) return;
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      setOrder((o) => o ? { ...o, status: selectedStatus } : o);
      onStatusChanged();
    } catch (e) {
      setError(String(e));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {order ? `طلب ${order.orderNumber}` : "تفاصيل الطلب"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="p-5">
          {loading && <p className="text-sm text-text-muted text-center py-8">جاري التحميل...</p>}
          {error && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{error}</p>}

          {order && (
            <div className="space-y-5">
              {/* Status update */}
              <div className="flex items-center gap-3 p-4 bg-surface-alt rounded-lg border border-border">
                <span className="text-sm text-text-muted shrink-0">الحالة:</span>
                <StatusBadge status={order.status} />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 h-9 px-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || selectedStatus === order.status}
                  className="h-9 px-4 bg-accent text-accent-fg text-sm font-medium rounded hover:bg-accent-hover transition-colors disabled:opacity-50 shrink-0"
                >
                  {updating ? "..." : "تحديث"}
                </button>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-surface-alt rounded-lg border border-border space-y-1">
                  <p className="text-text-muted text-xs">رقم الطلب</p>
                  <p className="text-text font-mono font-medium" dir="ltr">{order.orderNumber}</p>
                </div>
                <div className="p-3 bg-surface-alt rounded-lg border border-border space-y-1">
                  <p className="text-text-muted text-xs">تاريخ الطلب</p>
                  <p className="text-text font-medium" dir="ltr">{new Date(order.placedAt).toLocaleDateString("ar-EG")}</p>
                </div>
                <div className="p-3 bg-surface-alt rounded-lg border border-border space-y-1">
                  <p className="text-text-muted text-xs">المجموع الفرعي</p>
                  <p className="text-text font-medium" dir="ltr">{order.subTotal.toFixed(2)} ج.م</p>
                </div>
                <div className="p-3 bg-surface-alt rounded-lg border border-border space-y-1">
                  <p className="text-text-muted text-xs">الإجمالي</p>
                  <p className="text-accent font-semibold" dir="ltr">{order.total.toFixed(2)} ج.م</p>
                </div>
              </div>

              {/* Shipping address */}
              <div className="p-4 bg-surface-alt rounded-lg border border-border space-y-1 text-sm">
                <p className="text-text-muted text-xs font-medium mb-2">عنوان الشحن</p>
                <p className="text-text font-medium">{order.shippingFullName}</p>
                <p className="text-text-muted">{order.shippingPhone}</p>
                <p className="text-text-muted">{order.shippingAddressLine1}
                  {order.shippingAddressLine2 ? `، ${order.shippingAddressLine2}` : ""}</p>
                <p className="text-text-muted">{order.shippingCity}، {order.shippingGovernorate} {order.shippingPostalCode}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">منتجات الطلب ({order.items.length})</p>
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-alt">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded shrink-0" />
                        : <div className="w-10 h-10 bg-border rounded shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text line-clamp-1">{item.name}</p>
                        <p className="text-xs text-text-muted font-mono" dir="ltr">{item.sku} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-text shrink-0" dir="ltr">{item.subTotal.toFixed(2)} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-surface-alt rounded-lg border border-border text-sm">
                  <p className="text-text-muted text-xs mb-1">ملاحظات</p>
                  <p className="text-text">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(() => {
    setLoading(true);
    fetchOrders()
      .then(setOrders)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">الطلبات</h1>
        <button
          onClick={load}
          className="h-8 px-3 text-xs border border-border rounded text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
        >
          تحديث
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {[{ id: "all", label: "الكل" }, ...ORDER_STATUSES.map((s) => ({ id: s, label: STATUS_LABELS[s] ?? s }))].map((t) => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            className={[
              "px-3 py-2 text-sm font-medium transition-colors -mb-px border-b-2",
              statusFilter === t.id
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{error}</p>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-surface-alt animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-text-muted text-sm rounded-lg border border-dashed border-border">
          لا توجد طلبات
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="text-right font-medium text-text-muted px-4 py-3">رقم الطلب</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">الحالة</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">المنتجات</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">الإجمالي</th>
                <th className="text-right font-medium text-text-muted px-4 py-3">التاريخ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-surface-alt transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-text">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-text-muted">{order.itemCount}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-text" dir="ltr">{order.total.toFixed(2)} ج.م</span>
                  </td>
                  <td className="px-4 py-3 text-text-muted" dir="ltr">
                    {new Date(order.placedAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="text-xs text-accent hover:underline"
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChanged={load}
        />
      )}
    </div>
  );
}
