import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import type { Brand, PagedResult, ProductSummary } from "@/modules/catalog/types";

interface BrandPageModuleProps {
  brand: Brand;
  paged: PagedResult<ProductSummary>;
  page: number;
  condition: string | undefined;
  locale: string;
}

export async function BrandPageModule({ brand, paged, page, condition, locale }: BrandPageModuleProps) {
  const t = await getTranslations({ locale, namespace: "catalog" });

  const conditionTabs = [
    { value: null,          label: t("allConditions") },
    { value: "Original",    label: t("conditionOriginal") },
    { value: "Aftermarket", label: t("conditionAftermarket") },
    { value: "Used",        label: t("conditionUsed") },
  ];

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Brand hero strip */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-surface rounded-lg border border-border">
        {brand.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-16 h-16 object-contain"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-text">{brand.name}</h1>
          <p className="text-sm text-text-muted mt-1">{t("productCount", { count: paged.totalCount })}</p>
        </div>
      </div>

      {/* Condition filter tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-4">
        {conditionTabs.map(({ value, label }) => (
          <a
            key={label}
            href={`?${new URLSearchParams({
              ...(value ? { condition: value } : {}),
              page: "1",
            }).toString()}`}
            className={[
              "px-4 py-2 text-sm rounded transition-colors",
              condition === value || (!condition && !value)
                ? "bg-accent text-accent-fg font-medium"
                : "text-text-muted hover:text-text",
            ].join(" ")}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Product grid */}
      {paged.items.length === 0 ? (
        <p className="text-text-muted text-center py-16">{t("noProductsForBrand")}</p>
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
          {page > 1 && (
            <a
              href={`?page=${page - 1}${condition ? `&condition=${condition}` : ""}`}
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
              href={`?page=${page + 1}${condition ? `&condition=${condition}` : ""}`}
              className="px-4 py-2 text-sm border border-border rounded hover:bg-surface-alt text-text transition-colors"
            >
              →
            </a>
          )}
        </nav>
      )}
    </main>
  );
}
