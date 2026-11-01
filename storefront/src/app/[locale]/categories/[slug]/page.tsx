import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import {
  getCategoryBySlug,
  getProducts,
} from "@/modules/catalog/actions/catalogActions";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; condition?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr, condition } = await searchParams;
  const page = Number(pageStr ?? "1") || 1;

  const [category, paged] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({ categoryId: slug, condition, page, pageSize: 24 }),
  ]);

  if (!category) notFound();

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-muted mb-6" aria-label="التنقل">
          <span>الرئيسية</span>
          <span className="mx-2">›</span>
          <span className="text-text">{category.name}</span>
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">{category.name}</h1>
            <p className="text-sm text-text-muted mt-1">{paged.totalCount} منتج</p>
          </div>
        </div>

        {/* Subcategories */}
        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {category.children.map((child) => (
              <a
                key={child.id}
                href={`/categories/${child.slug}`}
                className="px-4 py-2 text-sm rounded-full border border-border text-text-muted hover:border-accent hover:text-text transition-colors"
              >
                {child.name}
              </a>
            ))}
          </div>
        )}

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
          <p className="text-text-muted text-center py-16">لا توجد منتجات في هذه الفئة</p>
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
  const category = await getCategoryBySlug(slug);
  return {
    title: category ? `${category.name} | PartZone` : "فئة",
  };
}
