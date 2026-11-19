import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Category } from "@/modules/catalog/types";

interface Props {
  categories: Category[];
  locale: string;
}

export async function CategoriesPageModule({ categories, locale }: Props) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const topLevel = categories.filter((c) => c.parentId === null);

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <a href={`/${locale}`} className="hover:text-text transition-colors">{tCommon("home")}</a>
        <span className="mx-2">›</span>
        <span className="text-text">{t("allCategories")}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">{t("allCategories")}</h1>
        <p className="text-sm text-text-muted mt-1">{t("categoryCount", { count: topLevel.length })}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {topLevel.map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}/categories/${cat.slug}`}
            className="group bg-surface border border-border rounded-xl p-5 flex flex-col items-center gap-3 hover:border-accent transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center group-hover:border-accent transition-colors">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt={cat.name} className="w-9 h-9 object-contain" />
              ) : (
                <span className="text-2xl" role="img" aria-label={cat.name}>📦</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text leading-snug line-clamp-2">
                {cat.name}
              </p>
              {cat.children.length > 0 && (
                <p className="text-xs text-text-muted mt-1">
                  {t("subcategoryCount", { count: cat.children.length })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
