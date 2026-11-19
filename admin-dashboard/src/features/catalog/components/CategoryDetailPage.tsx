import { useQuery, useMutation } from "@apollo/client";
import { useParams, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { GET_CATEGORY_BY_ID, UPDATE_CATEGORY } from "../graphql/catalogApi";
import { Category } from "../categories/types";
import { FlagToggle } from "../shared/FlagToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CategoryDetailPage() {
  const params = useParams({ strict: false }) as { categoryId?: string };
  const router = useRouter();
  const categoryId = params.categoryId ?? "";

  const { data, loading, refetch } = useQuery<{ categoryById: Category | null }>(
    GET_CATEGORY_BY_ID,
    { variables: { id: categoryId }, skip: !categoryId }
  );

  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useLanguage();
  const category = data?.categoryById;

  const setFlag = async (
    flag: "isActive" | "isFeatured" | "showInHome" | "showInMenu",
    value: boolean
  ) => {
    if (!category) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateCategory({
        variables: {
          input: {
            id: category.id,
            name: category.name,
            imageUrl: category.imageUrl,
            sortOrder: category.sortOrder,
            [flag]: value,
          },
        },
      });
      const errs = result.data?.updateCategory?.errors ?? [];
      if (errs.length) setError(errs[0]);
      else refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">{t("loading")}</div>;
  if (!category) return <div className="p-8 text-error">{t("categoryNotFound")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.history.back()}
        className="text-sm text-accent hover:underline"
      >
        {t("back")}
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-start gap-4">
          {category.imageUrl && (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-16 h-16 object-cover rounded-lg border border-border"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-text">{category.name}</h1>
            <p className="text-sm text-text-muted mt-1">/{category.slug}</p>
            <p className="text-sm text-text-muted">{t("displayOrder").replace("{n}", String(category.sortOrder))}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">{t("flagsSection")}</h2>
        <div className="divide-y divide-border">
          <FlagToggle
            label={t("flagActive")}
            checked={category.isActive}
            busy={busy}
            onChange={(v) => setFlag("isActive", v)}
          />
          <FlagToggle
            label={t("flagFeatured")}
            checked={category.isFeatured}
            busy={busy}
            onChange={(v) => setFlag("isFeatured", v)}
          />
          <FlagToggle
            label={t("flagShowInHome")}
            checked={category.showInHome}
            busy={busy}
            onChange={(v) => setFlag("showInHome", v)}
          />
          <FlagToggle
            label={t("flagShowInMenu")}
            checked={category.showInMenu}
            busy={busy}
            onChange={(v) => setFlag("showInMenu", v)}
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
