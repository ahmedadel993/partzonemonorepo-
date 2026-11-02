import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_ALL_COUPONS,
  CREATE_COUPON,
  UPDATE_COUPON,
  DEACTIVATE_COUPON,
} from "../graphql/marketingApi";
import type { Coupon } from "../types/marketing.types";
import type { CouponFormValues } from "../schemas/marketing.schemas";
import { CouponForm } from "./CouponForm";

function Drawer({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={[
        "fixed top-0 end-0 h-full w-full max-w-lg bg-surface border-s border-border z-50",
        "transition-transform duration-300 overflow-y-auto",
        open ? "translate-x-0" : "translate-x-full",
      ].join(" ")} dir="rtl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}

export function CouponsPanel() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const { data, loading, refetch } = useQuery<{ coupons: Coupon[] }>(GET_ALL_COUPONS);
  const [createCoupon, { loading: creating }] = useMutation(CREATE_COUPON);
  const [updateCoupon, { loading: updating }] = useMutation(UPDATE_COUPON);
  const [deactivateCoupon] = useMutation(DEACTIVATE_COUPON);

  const coupons = data?.coupons ?? [];

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const handleSubmit = async (vals: CouponFormValues) => {
    if (editing) {
      await updateCoupon({
        variables: {
          input: {
            id: editing.id,
            discountType: vals.discountType,
            value: vals.value,
            minOrderAmount: vals.minOrderAmount ?? null,
            usageLimit: vals.usageLimit,
            perUserLimit: vals.perUserLimit,
            validFrom: vals.validFrom,
            validTo: vals.validTo,
            isActive: vals.isActive,
          },
        },
      });
    } else {
      await createCoupon({
        variables: {
          input: {
            code: vals.code.toUpperCase(),
            discountType: vals.discountType,
            value: vals.value,
            minOrderAmount: vals.minOrderAmount ?? null,
            usageLimit: vals.usageLimit,
            perUserLimit: vals.perUserLimit,
            validFrom: vals.validFrom,
            validTo: vals.validTo,
          },
        },
      });
    }
    await refetch();
    closeDrawer();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text">كوبونات الخصم</h3>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 bg-accent text-accent-fg text-sm font-medium rounded hover:bg-accent-hover transition-colors"
        >
          + إضافة كوبون
        </button>
      </div>

      {loading && <p className="text-text-muted text-sm">جاري التحميل...</p>}

      {!loading && coupons.length === 0 && (
        <p className="text-text-muted text-sm text-center py-8">لا توجد كوبونات حالياً</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs">
              <th className="py-2 px-3 text-start">الكود</th>
              <th className="py-2 px-3 text-start">النوع</th>
              <th className="py-2 px-3 text-start">القيمة</th>
              <th className="py-2 px-3 text-start">الاستخدام</th>
              <th className="py-2 px-3 text-start">الصلاحية</th>
              <th className="py-2 px-3 text-start">الحالة</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-surface-alt/50">
                <td className="py-2 px-3 font-mono text-accent">{c.code}</td>
                <td className="py-2 px-3 text-text-muted">
                  {c.discountType === "Percentage" ? "%" : "ج.م"}
                </td>
                <td className="py-2 px-3 text-text">{c.value}</td>
                <td className="py-2 px-3 text-text-muted">
                  {c.usedCount}{c.usageLimit > 0 ? `/${c.usageLimit}` : ""}
                </td>
                <td className="py-2 px-3 text-text-muted text-xs">
                  {c.validFrom.slice(0, 10)} → {c.validTo.slice(0, 10)}
                </td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${c.isActive ? "bg-success/20 text-success" : "bg-surface-alt text-text-muted"}`}>
                    {c.isActive ? "مفعّل" : "معطّل"}
                  </span>
                </td>
                <td className="py-2 px-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline">تعديل</button>
                  {c.isActive && (
                    <button
                      onClick={async () => { await deactivateCoupon({ variables: { id: c.id } }); refetch(); }}
                      className="text-xs text-danger hover:underline"
                    >
                      تعطيل
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer
        open={drawerOpen}
        title={editing ? "تعديل كوبون" : "إضافة كوبون جديد"}
        onClose={closeDrawer}
      >
        <CouponForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={creating || updating}
        />
      </Drawer>
    </div>
  );
}
