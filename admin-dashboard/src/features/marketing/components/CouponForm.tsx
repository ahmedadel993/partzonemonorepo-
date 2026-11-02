import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponFormSchema, type CouponFormValues } from "../schemas/marketing.schemas";
import type { Coupon } from "../types/marketing.types";

const DISCOUNT_TYPES = [
  { value: "FixedAmount", label: "مبلغ ثابت" },
  { value: "Percentage", label: "نسبة مئوية" },
];

interface Props {
  initial?: Coupon;
  onSubmit: (values: CouponFormValues) => void;
  loading?: boolean;
}

export function CouponForm({ initial, onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: initial?.code ?? "",
      discountType: initial?.discountType ?? "Percentage",
      value: initial?.value ?? 10,
      minOrderAmount: initial?.minOrderAmount ?? undefined,
      usageLimit: initial?.usageLimit ?? 0,
      perUserLimit: initial?.perUserLimit ?? 0,
      validFrom: initial?.validFrom?.slice(0, 16) ?? "",
      validTo: initial?.validTo?.slice(0, 16) ?? "",
      isActive: initial?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" dir="rtl">
      <div>
        <label className="block text-xs text-text-muted mb-1">كود الخصم</label>
        <input
          {...register("code")}
          dir="ltr"
          placeholder="PROMO10"
          disabled={!!initial}
          className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text uppercase disabled:opacity-60"
        />
        {errors.code && <p className="text-danger text-xs mt-1">{errors.code.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">نوع الخصم</label>
          <select {...register("discountType")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text">
            {DISCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">القيمة</label>
          <input type="number" step="0.01" {...register("value")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          {errors.value && <p className="text-danger text-xs mt-1">{errors.value.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs text-text-muted mb-1">حد أدنى للطلب (اختياري)</label>
        <input type="number" step="0.01" {...register("minOrderAmount")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">حد الاستخدام الكلي (0 = لامحدود)</label>
          <input type="number" {...register("usageLimit")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">حد الاستخدام للمستخدم (0 = لامحدود)</label>
          <input type="number" {...register("perUserLimit")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">صالح من</label>
          <input type="datetime-local" {...register("validFrom")} dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          {errors.validFrom && <p className="text-danger text-xs mt-1">{errors.validFrom.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">صالح حتى</label>
          <input type="datetime-local" {...register("validTo")} dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          {errors.validTo && <p className="text-danger text-xs mt-1">{errors.validTo.message}</p>}
        </div>
      </div>

      {initial && (
        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" {...register("isActive")} className="accent-accent" />
          مفعّل
        </label>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-accent text-accent-fg font-medium rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading ? "جاري الحفظ..." : initial ? "تحديث" : "إضافة"}
      </button>
    </form>
  );
}
