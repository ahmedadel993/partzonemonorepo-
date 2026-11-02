import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface LowStockProduct {
  id: string;
  sku: string;
  name: string;
  stock: number;
}

const API = import.meta.env.VITE_API_URL ?? "/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pz_access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

// ── Drawer ────────────────────────────────────────────────────────────────────

function Drawer({
  open, title, onClose, children,
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <aside className={[
        "fixed top-0 end-0 h-full w-96 bg-surface border-s border-border z-50",
        "transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
      ].join(" ")}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <h2 className="font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text text-xl leading-none">×</button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
      </aside>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-text-muted mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-surface-alt border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

// ── Adjustment form ───────────────────────────────────────────────────────────

const adjustSchema = z.object({
  productId: z.string().uuid("اختر منتجاً"),
  delta: z.coerce.number().int().refine((n) => n !== 0, "يجب ألّا يكون الفرق صفراً"),
  reason: z.string().min(1, "مطلوب").max(500),
});
type AdjustForm = z.infer<typeof adjustSchema>;

function AdjustmentDrawer({
  products, onClose, onDone,
}: { products: LowStockProduct[]; onClose: () => void; onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdjustForm>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { productId: "", delta: 0, reason: "" },
  });

  const onSubmit = async (data: AdjustForm) => {
    setServerError(null);
    const r = await fetch(`${API}/admin/erp/adjustments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ productId: data.productId, delta: data.delta, reason: data.reason }),
    });
    if (!r.ok) {
      setServerError(`فشل التعديل (HTTP ${r.status})`);
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="المنتج" error={errors.productId?.message}>
        <select {...register("productId")} className={inputCls}>
          <option value="">— اختر منتجاً —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name} (المخزون: {p.stock})
            </option>
          ))}
        </select>
      </Field>

      <Field label="الفرق (موجب = إضافة، سالب = خصم)" error={errors.delta?.message}>
        <input type="number" {...register("delta")} className={inputCls} placeholder="مثال: 50 أو -10" />
      </Field>

      <Field label="السبب" error={errors.reason?.message}>
        <input type="text" {...register("reason")} className={inputCls} placeholder="مثال: استلام بضاعة جديدة" />
      </Field>

      {serverError && <p className="text-danger text-xs mb-4">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-accent text-white rounded-md py-2 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "جارٍ الحفظ…" : "تسجيل التعديل"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-surface-alt text-text rounded-md py-2 text-sm font-medium hover:bg-border transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const THRESHOLD = 10;

export default function ErpStub() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API}/admin/erp/inventory?threshold=${THRESHOLD}`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<LowStockProduct[]>;
      })
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text">إدارة المخزون</h2>
          <p className="text-xs text-text-muted mt-0.5">المنتجات ذات المخزون ≤ {THRESHOLD}</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          + تعديل مخزون
        </button>
      </div>

      {error && (
        <p className="text-danger text-sm mb-4">خطأ في تحميل المخزون: {error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-surface-alt rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-right">
              <th className="pb-3 font-medium pe-4">SKU</th>
              <th className="pb-3 font-medium pe-4">الاسم</th>
              <th className="pb-3 font-medium pe-4">المخزون</th>
              <th className="pb-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-alt transition-colors">
                <td className="py-3 pe-4 font-mono text-xs text-text-muted" dir="ltr">{p.sku}</td>
                <td className="py-3 pe-4 text-text">{p.name}</td>
                <td className="py-3 pe-4 text-text font-semibold">{p.stock}</td>
                <td className="py-3">
                  <span className={[
                    "px-2 py-0.5 rounded text-xs font-medium",
                    p.stock <= 5
                      ? "bg-danger/15 text-danger"
                      : "bg-warning/15 text-warning",
                  ].join(" ")}>
                    {p.stock <= 5 ? "حرج" : "منخفض"}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted text-sm">
                  جميع المنتجات لديها مخزون كافٍ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Drawer open={drawerOpen} title="تسجيل تعديل مخزون" onClose={() => setDrawerOpen(false)}>
        {drawerOpen && (
          <AdjustmentDrawer
            products={products}
            onClose={() => setDrawerOpen(false)}
            onDone={() => { setDrawerOpen(false); load(); }}
          />
        )}
      </Drawer>
    </div>
  );
}
