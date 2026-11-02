import { Header } from "@/shared/ui/Header";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import { getProducts } from "@/modules/catalog/actions/catalogActions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    condition?: string;
    categoryId?: string;
    brandId?: string;
    vehicleModelId?: string;
  }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, page: pageStr, condition, categoryId, brandId, vehicleModelId } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const paged = await getProducts({
    q,
    page,
    pageSize: 24,
    condition: condition ?? null,
    categoryId: categoryId ?? null,
    brandId: brandId ?? null,
    vehicleModelId: vehicleModelId ?? null,
  });

  const title = vehicleModelId && !q
    ? "قطع غيار لمركبتك"
    : q ? `نتائج "${q}"` : "البحث";

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text">{title}</h1>
            <p className="text-sm text-text-muted mt-1">
              {paged.totalCount} نتيجة
            </p>
          </div>
          {vehicleModelId && (
            <a
              href={`/${locale}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-colors"
            >
              <span>تصفية حسب المركبة</span>
              <span className="text-accent/70">×</span>
            </a>
          )}
        </div>

        {!q ? (
          <p className="text-text-muted text-center py-16">أدخل كلمة بحث للمتابعة</p>
        ) : paged.items.length === 0 ? (
          <p className="text-text-muted text-center py-16">لا توجد نتائج لـ &ldquo;{q}&rdquo;</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paged.items.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 8} />
              ))}
            </div>

            {paged.totalPages > 1 && (
              <nav className="flex justify-center gap-2 mt-10" aria-label="الصفحات" dir="ltr">
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
    </>
  );
}

export function generateMetadata() {
  return { title: "البحث | PartZone" };
}
