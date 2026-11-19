import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Brand } from "@/modules/catalog/types";

interface Props {
  brands: Brand[];
  locale: string;
}

export async function BrandsPageModule({ brands, locale }: Props) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const active = brands.filter((b) => b.isActive);

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <a href={`/${locale}`} className="hover:text-text transition-colors">{tCommon("home")}</a>
        <span className="mx-2">›</span>
        <span className="text-text">{t("allBrands")}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">{t("allBrands")}</h1>
        <p className="text-sm text-text-muted mt-1">{t("brandCount", { count: active.length })}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {active.map((brand) => (
          <Link
            key={brand.id}
            href={`/${locale}/brands/${brand.slug}`}
            className="group bg-surface border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:border-accent transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center overflow-hidden group-hover:border-accent transition-colors">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <span className="text-base font-bold text-text-muted group-hover:text-accent transition-colors">
                  {brand.name.slice(0, 2)}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-text text-center line-clamp-2 leading-snug">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
