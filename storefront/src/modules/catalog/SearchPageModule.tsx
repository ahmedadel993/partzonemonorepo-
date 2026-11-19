import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import type { PagedResult, ProductSummary } from "@/modules/catalog/types";

interface SearchPageModuleProps {
  paged: PagedResult<ProductSummary>;
  page: number;
  q: string | undefined;
  condition: string | undefined;
  categoryId: string | undefined;
  brandId: string | undefined;
  vehicleModelId: string | undefined;
  locale: string;
}

export async function SearchPageModule({
  paged,
  page,
  q,
  condition,
  categoryId,
  brandId,
  vehicleModelId,
  locale,
}: SearchPageModuleProps) {
  const t = await getTranslations({ locale, namespace: "catalog" });

  const title = vehicleModelId && !q
    ? t("searchVehicle")
    : q ? `${t("search")}: "${q}"` : t("search");

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-muted mt-1">
            {t("resultCount", { count: paged.totalCount })}
          </p>
        </div>
        {vehicleModelId && (
          <a
            href={`/${locale}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-colors"
          >
            <span>{t("filterByVehicle")}</span>
            <span className="text-accent/70">×</span>
          </a>
        )}
      </div>

      {!q && !vehicleModelId ? (
        <p className="text-text-muted text-center py-16">{t("noSearchQuery")}</p>
      ) : paged.items.length === 0 ? (
        <p className="text-text-muted text-center py-16">
          {q ? t("noSearchResults", { q }) : t("noVehicleParts")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paged.items.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 8} />
            ))}
          </div>

          {paged.totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-10" aria-label="pages" dir="ltr">
              {(() => {
                const base: Record<string, string> = {};
                if (q) base.q = q;
                if (vehicleModelId) base.vehicleModelId = vehicleModelId;
                if (condition) base.condition = condition;
                if (categoryId) base.categoryId = categoryId;
                if (brandId) base.brandId = brandId;
                return (
                  <>
                    {page > 1 && (
                      <a
                        href={`?${new URLSearchParams({ ...base, page: String(page - 1) }).toString()}`}
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
                        href={`?${new URLSearchParams({ ...base, page: String(page + 1) }).toString()}`}
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
        </>
      )}
    </main>
  );
}
