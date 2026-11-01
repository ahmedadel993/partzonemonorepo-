import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import {
  getBrandBySlug,
  getProducts,
} from "@/modules/catalog/actions/catalogActions";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; condition?: string }>;
};

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr, condition } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const [brand, paged] = await Promise.all([
    getBrandBySlug(slug),
    getProducts({ brandId: slug, condition, page, pageSize: 24 }),
  ]);

  if (!brand) notFound();

  return (
    <>
      <Header />
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
            <p className="text-sm text-text-muted mt-1">{paged.totalCount} منتج</p>
          </div>
        </div>

        {/* Condition filter tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          {[
            { value: null,          label: "الكل" },
            { value: "Original",    label: "أصلي" },
            { value: "Aftermarket", label: "بديل" },
            { value: "Used",        label: "مستعمل" },
          ].map(({ value, label }) => (
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
          <p className="text-text-muted text-center py-16">لا توجد منتجات لهذه الماركة</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paged.items.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 8} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {paged.totalPages > 1 && (
          <nav className="flex justify-center gap-2 mt-10" aria-label="الصفحات" dir="ltr">
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
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return {
    title: brand ? `${brand.name} | PartZone` : "ماركة",
  };
}
