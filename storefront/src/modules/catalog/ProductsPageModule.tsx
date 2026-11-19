import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import { FilterBar } from "@/modules/catalog/components/FilterBar";
import type { Brand, Category, PagedResult, ProductSummary } from "@/modules/catalog/types";

interface Props {
  paged: PagedResult<ProductSummary>;
  brands: Brand[];
  categories: Category[];
  page: number;
  filters: {
    brandId?: string;
    categoryId?: string;
    condition?: string;
    q?: string;
  };
  locale: string;
}

export async function ProductsPageModule({ paged, brands, categories, page, filters, locale }: Props) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (filters.brandId) params.set("brandId", filters.brandId);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.condition) params.set("condition", filters.condition);
    if (filters.q) params.set("q", filters.q);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <a href={`/${locale}`} className="hover:text-text transition-colors">{tCommon("home")}</a>
        <span className="mx-2">›</span>
        <span className="text-text">{t("allProducts")}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{t("allProducts")}</h1>
          <p className="text-sm text-text-muted mt-1">{t("productCount", { count: paged.totalCount })}</p>
        </div>
      </div>

      {/* Filter Bar — client component wrapped in Suspense for useSearchParams */}
      <Suspense>
        <FilterBar brands={brands} categories={categories} current={filters} />
      </Suspense>

      {/* Product grid */}
      {paged.items.length === 0 ? (
        <p className="text-text-muted text-center py-16">{t("noProductsMatch")}</p>
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
              href={buildPageUrl(page - 1)}
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
              href={buildPageUrl(page + 1)}
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
