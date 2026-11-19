import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Category } from "@/modules/catalog/types";

interface Props {
  categories: Category[];
  vehicleModelId: string;
  makeName?: string | null;
  modelName?: string | null;
  locale: string;
}

export async function VehicleCategoryStrip({ categories, vehicleModelId, makeName, modelName, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "catalog" });

  if (categories.length === 0) return null;

  const makeParam = makeName ? `&makeName=${encodeURIComponent(makeName)}` : "";
  const modelParam = modelName ? `&modelName=${encodeURIComponent(modelName)}` : "";

  return (
    <div className="space-y-3 mb-8">
      <h2 className="text-base font-semibold text-text">
        {t("vehicleCategories", { make: makeName ?? "", model: modelName ?? "" })}
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}/categories/${cat.slug}?vehicleModelId=${vehicleModelId}${makeParam}${modelParam}`}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text hover:border-accent hover:text-accent transition-colors"
          >
            {cat.imageUrl && (
              <img src={cat.imageUrl} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />
            )}
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
