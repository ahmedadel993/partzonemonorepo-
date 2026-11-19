import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageBlockFormSchema, type PageBlockFormValues } from "../schemas/marketing.schemas";
import type { PageBlock } from "../types/marketing.types";
import { ImageUploadField } from "@/components/ImageUploadField";
import { useLanguage } from "@/contexts/LanguageContext";

/** UTC ISO string from the API → value for <input type="datetime-local"> (browser local time). */
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (local time) → UTC ISO string for the API. */
export function localInputToIso(value: string | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseConfig(config: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(config || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

interface Props {
  initial?: PageBlock;
  /** Sort order for a new block (defaults to the end of the list). */
  defaultSortOrder?: number;
  onSubmit: (values: PageBlockFormValues) => void;
  loading?: boolean;
}

export function PageBlockForm({ initial, defaultSortOrder = 0, onSubmit, loading }: Props) {
  const { t, dir } = useLanguage();
  const ar = initial?.translations.find((tr) => tr.locale === "ar");
  const en = initial?.translations.find((tr) => tr.locale === "en");

  const BLOCK_TYPES = [
    { value: "Hero", label: t("blockTypeHero") },
    { value: "VehicleStrip", label: t("blockTypeVehicleStrip") },
    { value: "CategoryGrid", label: t("blockTypeCategoryGrid") },
    { value: "ProductList", label: t("blockTypeProductList") },
    { value: "BannerSingle", label: t("blockTypeBannerSingle") },
    { value: "BannerDouble", label: t("blockTypeBannerDouble") },
  ];

  const BINDING_TYPES = [
    { value: "None", label: t("bindingNone") },
    { value: "Category", label: t("bindingCategory") },
    { value: "Brand", label: t("bindingBrand") },
    { value: "Product", label: t("bindingProduct") },
    { value: "VehicleMake", label: t("bindingVehicleMake") },
    { value: "VehicleModel", label: t("bindingVehicleModel") },
    { value: "Url", label: t("bindingUrl") },
  ];

  const IMAGE_FIELDS: Record<string, { key: string; label: string }[]> = {
    Hero: [
      { key: "heroImageUrl", label: t("imgHeroSide") },
      { key: "backgroundImageUrl", label: t("imgHeroBg") },
    ],
    BannerSingle: [{ key: "imageUrl", label: t("imgBannerSingle") }],
    BannerDouble: [
      { key: "rightImageUrl", label: t("imgBannerRight") },
      { key: "leftImageUrl", label: t("imgBannerLeft") },
    ],
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PageBlockFormValues>({
    resolver: zodResolver(pageBlockFormSchema),
    defaultValues: {
      type: initial?.type ?? "Hero",
      sortOrder: initial?.sortOrder ?? defaultSortOrder,
      config: initial?.config ?? "{}",
      bindingType: initial?.bindingType ?? "None",
      targetId: initial?.targetId ?? "",
      targetUrl: initial?.targetUrl ?? "",
      activeFrom: isoToLocalInput(initial?.activeFrom),
      activeTo: isoToLocalInput(initial?.activeTo),
      arTitle: ar?.title ?? "",
      arSubtitle: ar?.subtitle ?? "",
      arCtaText: ar?.ctaText ?? "",
      enTitle: en?.title ?? "",
      enSubtitle: en?.subtitle ?? "",
      enCtaText: en?.ctaText ?? "",
    },
  });

  const bindingType = watch("bindingType");
  const blockType = watch("type");
  const config = parseConfig(watch("config"));
  const imageFields = IMAGE_FIELDS[blockType] ?? [];

  // Write an image URL into the config JSON (remove the key when cleared).
  const setConfigImage = (key: string, url: string) => {
    const next = { ...(config ?? {}) };
    if (url) next[key] = url;
    else delete next[key];
    setValue("config", JSON.stringify(next, null, 2), { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={dir}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("blockTypeLabel")}</label>
          <select {...register("type")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text">
            {BLOCK_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
          </select>
          {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("blockSortLabel")}</label>
          <input type="number" {...register("sortOrder")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

      {imageFields.length > 0 && (
        <div className="border border-border rounded-lg p-3 space-y-4">
          {config === null ? (
            <p className="text-danger text-xs">{t("blockConfigError")}</p>
          ) : (
            imageFields.map((f) => (
              <ImageUploadField
                key={f.key}
                label={f.label}
                value={typeof config[f.key] === "string" ? (config[f.key] as string) : ""}
                onChange={(url) => setConfigImage(f.key, url)}
              />
            ))
          )}
        </div>
      )}

      <div>
        <label className="block text-xs text-text-muted mb-1">{t("blockConfigLabel")}</label>
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
          <label className="block text-xs text-text-muted mb-1">{t("blockBindingLabel")}</label>
          <select {...register("bindingType")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text">
            {BINDING_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        {bindingType === "Url" ? (
          <div>
            <label className="block text-xs text-text-muted mb-1">{t("blockUrlLabel")}</label>
            <input {...register("targetUrl")} placeholder="https://..." dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          </div>
        ) : bindingType !== "None" ? (
          <div>
            <label className="block text-xs text-text-muted mb-1">{t("blockTargetIdLabel")}</label>
            <input {...register("targetId")} dir="ltr" placeholder="GUID" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("blockActiveFromLabel")}</label>
          <input type="datetime-local" {...register("activeFrom")} dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("blockActiveToLabel")}</label>
          <input type="datetime-local" {...register("activeTo")} dir="ltr" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

      <div className="border border-border rounded-lg p-3 space-y-3">
        <p className="text-sm font-medium text-text">{t("blockTranslations")}</p>
        <div className="space-y-2" dir="rtl">
          <p className="text-xs text-text-muted font-medium">{t("transLangAr")}</p>
          <input {...register("arTitle")} placeholder={t("transTitle")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("arSubtitle")} placeholder={t("transSubtitle")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("arCtaText")} placeholder={t("transCtaText")} className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
        <div className="space-y-2" dir="ltr">
          <p className="text-xs text-text-muted font-medium">English</p>
          <input {...register("enTitle")} placeholder="Title in English" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("enSubtitle")} placeholder="Subtitle in English" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
          <input {...register("enCtaText")} placeholder="CTA text in English" className="w-full bg-surface-alt border border-border rounded px-2 py-1.5 text-sm text-text" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-accent text-accent-fg font-medium rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading ? t("blockSaving") : initial ? t("blockSave") : t("blockAdd")}
      </button>
    </form>
  );
}
