import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageBlockFormSchema, type PageBlockFormValues } from "../schemas/marketing.schemas";
import type { PageBlock } from "../types/marketing.types";

const BLOCK_TYPES = [
  { value: "Hero", label: "Hero — صفحة البطل" },
  { value: "VehicleStrip", label: "VehicleStrip — شريط ماركات السيارات" },
  { value: "CategoryGrid", label: "CategoryGrid — شبكة التصنيفات" },
  { value: "ProductList", label: "ProductList — قائمة المنتجات" },
  { value: "BannerSingle", label: "BannerSingle — بانر واحد" },
  { value: "BannerDouble", label: "BannerDouble — بانر مزدوج" },
];

const BINDING_TYPES = [
  { value: "None", label: "بدون ربط" },
  { value: "Category", label: "تصنيف" },
  { value: "Brand", label: "ماركة" },
  { value: "Product", label: "منتج" },
  { value: "VehicleMake", label: "ماركة سيارة" },
  { value: "VehicleModel", label: "موديل سيارة" },
  { value: "Url", label: "رابط" },
];

interface Props {
  initial?: PageBlock;
  onSubmit: (values: PageBlockFormValues) => void;
  loading?: boolean;
}

export function PageBlockForm({ initial, onSubmit, loading }: Props) {
  const ar = initial?.translations.find((t) => t.locale === "ar");
  const en = initial?.translations.find((t) => t.locale === "en");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PageBlockFormValues>({
    resolver: zodResolver(pageBlockFormSchema),
    defaultValues: {
      type: initial?.type ?? "Hero",
      sortOrder: initial?.sortOrder ?? 0,
      config: initial?.config ?? "{}",
      bindingType: initial?.bindingType ?? "None",
      targetId: initial?.targetId ?? "",
      targetUrl: initial?.targetUrl ?? "",
      activeFrom: initial?.activeFrom?.slice(0, 16) ?? "",
      activeTo: initial?.activeTo?.slice(0, 16) ?? "",
      arTitle: ar?.title ?? "",
      arSubtitle: ar?.subtitle ?? "",
      arCtaText: ar?.ctaText ?? "",
      enTitle: en?.title ?? "",
      enSubtitle: en?.subtitle ?? "",
      enCtaText: en?.ctaText ?? "",
    },
  });

  const bindingType = watch("bindingType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">النوع</label>
          <select {...register("type")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text">
            {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">الترتيب</label>
          <input type="number" {...register("sortOrder")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-text-muted mb-1">Config (JSON)</label>
        <textarea
          {...register("config")}
          rows={4}
          dir="ltr"
          className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text font-mono"
        />
        {errors.config && <p className="text-danger text-xs mt-1">{errors.config.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">نوع الربط</label>
          <select {...register("bindingType")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text">
            {BINDING_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        {bindingType === "Url" ? (
          <div>
            <label className="block text-xs text-text-muted mb-1">الرابط</label>
            <input {...register("targetUrl")} placeholder="https://..." dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          </div>
        ) : bindingType !== "None" ? (
          <div>
            <label className="block text-xs text-text-muted mb-1">معرف الهدف</label>
            <input {...register("targetId")} dir="ltr" placeholder="GUID" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">تفعيل من</label>
          <input type="datetime-local" {...register("activeFrom")} dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">تفعيل حتى</label>
          <input type="datetime-local" {...register("activeTo")} dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

      {/* Translations */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <p className="text-sm font-medium text-text">الترجمات</p>
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-medium">🇸🇦 عربي</p>
          <input {...register("arTitle")} placeholder="العنوان بالعربية" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("arSubtitle")} placeholder="العنوان الفرعي بالعربية" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("arCtaText")} placeholder="نص الزر بالعربية" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-medium">🇬🇧 English</p>
          <input {...register("enTitle")} placeholder="Title in English" dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("enSubtitle")} placeholder="Subtitle in English" dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("enCtaText")} placeholder="CTA text in English" dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

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
