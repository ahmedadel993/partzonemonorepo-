import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import type { Category, PagedResult, ProductSummary } from "@/modules/catalog/types";

interface CategoryPageModuleProps {
  category: Category;
  paged: PagedResult<ProductSummary>;
  page: number;
  condition: string | undefined;
  vehicleModelId?: string;
  makeName?: string;
  modelName?: string;
  locale: string;
}

export async function CategoryPageModule({
  category,
  paged,
  page,
  condition,
  vehicleModelId,
  makeName,
  modelName,
  locale,
}: CategoryPageModuleProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const conditionTabs = [
    { value: null,          label: t("allConditions") },
    { value: "Original",    label: t("conditionOriginal") },
    { value: "Aftermarket", label: t("conditionAftermarket") },
    { value: "Used",        label: t("conditionUsed") },
  ];

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6" aria-label="breadcrumb">
        <a href={`/${locale}`} className="hover:text-text transition-colors">{tCommon("home")}</a>
        <span className="mx-2">›</span>
        <span className="text-text">{category.name}</span>
      </nav>

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{category.name}</h1>
          <p className="text-sm text-text-muted mt-1">{t("productCount", { count: paged.totalCount })}</p>
        </div>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.children.map((child) => {
            const childParams = new URLSearchParams();
            if (vehicleModelId) childParams.set("vehicleModelId", vehicleModelId);
            if (makeName) childParams.set("makeName", makeName);
            if (modelName) childParams.set("modelName", modelName);
            const childQs = childParams.toString();
            return (
              <a
                key={child.id}
                href={`/${locale}/categories/${child.slug}${childQs ? `?${childQs}` : ""}`}
                className="px-4 py-2 text-sm rounded-full border border-border text-text-muted hover:border-accent hover:text-text transition-colors"
              >
                {child.name}
              </a>
            );
          })}
        </div>
      )}

      {/* Condition filter tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-4">
        {conditionTabs.map(({ value, label }) => {
          const tabParams = new URLSearchParams({ page: "1" });
          if (value) tabParams.set("condition", value);
          if (vehicleModelId) tabParams.set("vehicleModelId", vehicleModelId);
          if (makeName) tabParams.set("makeName", makeName);
          if (modelName) tabParams.set("modelName", modelName);
          return (
            <a
              key={label}
              href={`?${tabParams.toString()}`}
              className={[
                "px-4 py-2 text-sm rounded transition-colors",
                condition === value || (!condition && !value)
                  ? "bg-accent text-accent-fg font-medium"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* Product grid */}
      {paged.items.length === 0 ? (
        <p className="text-text-muted text-center py-16">{t("noProductsInCategory")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paged.items.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 8} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paged.totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-10" aria-label="pages" dir="ltr">
          {(() => {
            const baseParams: Record<string, string> = { page: "1" };
            if (condition) baseParams.condition = condition;
            if (vehicleModelId) baseParams.vehicleModelId = vehicleModelId;
            if (makeName) baseParams.makeName = makeName;
            if (modelName) baseParams.modelName = modelName;
            return (
              <>
                {page > 1 && (
                  <a
                    href={`?${new URLSearchParams({ ...baseParams, page: String(page - 1) }).toString()}`}
                    className="px-4 py-2 text-sm border border-border rounded hover:bg-surface-alt text-text transition-colors"
                  >
                    ←
                  </a>
                )}
                <span className="px-4 py-2 text-sm text-text-muted">
                  {page} / {paged.totalPages}
                </span>
                {page < paged.totalPages && (
                  <a
                    href={`?${new URLSearchParams({ ...baseParams, page: String(page + 1) }).toString()}`}
                    className="px-4 py-2 text-sm border border-border rounded hover:bg-surface-alt text-text transition-colors"
                  >
                    →
                  </a>
                )}
              </>
            );
          })()}
        </nav>
      )}
    </main>
  );
}
