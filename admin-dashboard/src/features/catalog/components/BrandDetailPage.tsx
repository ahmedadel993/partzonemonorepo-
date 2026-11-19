import { useQuery, useMutation } from "@apollo/client";
import { useParams, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  GET_BRAND_BY_ID,
  UPDATE_BRAND,
  ACTIVATE_BRAND,
  DEACTIVATE_BRAND,
} from "../graphql/catalogApi";
import { Brand } from "../brands/types";
import { FlagToggle } from "../shared/FlagToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BrandDetailPage() {
  const params = useParams({ strict: false }) as { brandId?: string };
  const router = useRouter();
  const brandId = params.brandId ?? "";

  const { data, loading, refetch } = useQuery<{ brandById: Brand | null }>(
    GET_BRAND_BY_ID,
    { variables: { id: brandId }, skip: !brandId }
  );

  const [updateBrand] = useMutation(UPDATE_BRAND);
  const [activateBrand] = useMutation(ACTIVATE_BRAND);
  const [deactivateBrand] = useMutation(DEACTIVATE_BRAND);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useLanguage();
  const brand = data?.brandById;

  const toggleActive = async () => {
    if (!brand) return;
    setBusy(true);
    setError(null);
    try {
      const mutation = brand.isActive ? deactivateBrand : activateBrand;
      const result = await mutation({ variables: { brandId: brand.id } });
      const errs = result.data?.activateBrand?.errors ?? result.data?.deactivateBrand?.errors ?? [];
      if (errs.length) setError(errs[0]);
      else refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const setFlag = async (
    flag: "isFeatured" | "showInHome" | "isSponsored",
    value: boolean
  ) => {
    if (!brand) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateBrand({
        variables: {
          input: {
            id: brand.id,
            name: brand.name,
            logoUrl: brand.logoUrl,
            [flag]: value,
          },
        },
      });
      const errs = result.data?.updateBrand?.errors ?? [];
      if (errs.length) setError(errs[0]);
      else refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">{t("loading")}</div>;
  if (!brand) return <div className="p-8 text-error">{t("brandNotFound")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.history.back()}
        className="text-sm text-accent hover:underline"
      >
        {t("back")}
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-4">
          {brand.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-16 h-16 object-contain rounded-lg border border-border p-1"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-text">{brand.name}</h1>
            <p className="text-sm text-text-muted mt-1">/{brand.slug}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">{t("flagsSection")}</h2>
        <div className="divide-y divide-border">
          <FlagToggle
            label={t("flagActive")}
            checked={brand.isActive}
            busy={busy}
            onChange={toggleActive}
          />
          <FlagToggle
            label={t("flagFeatured")}
            checked={brand.isFeatured}
            busy={busy}
            onChange={(v) => setFlag("isFeatured", v)}
          />
          <FlagToggle
            label={t("flagShowInHome")}
            checked={brand.showInHome}
            busy={busy}
            onChange={(v) => setFlag("showInHome", v)}
          />
          <FlagToggle
            label={t("flagSponsored")}
            checked={brand.isSponsored}
            busy={busy}
            onChange={(v) => setFlag("isSponsored", v)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3 text-sm text-error">
          {error}
        </div>
      )}
    </div>
  );
}
