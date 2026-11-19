import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { PageBlockRenderer } from "@/modules/marketing/components/PageBlockRenderer";
import {
  FeaturedProductsSwiper,
  BestSellersSwiper,
  NewArrivalsSwiper,
  OnSaleSwiper,
} from "@/modules/catalog/components/HomeProductSwipers";
import { BrandsStripSection } from "@/modules/catalog/components/BrandsStripSection";

interface Props {
  params: Promise<{ locale: string }>;
}

const NAV_ICONS = [
  <svg key="products" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>,
  <svg key="brands" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>,
  <svg key="categories" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>,
  <svg key="offers" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
    <line x1="9.69" y1="8" x2="21.17" y2="8" />
    <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
    <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
    <line x1="14.31" y1="16" x2="2.83" y2="16" />
    <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
  </svg>,
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const navTiles = [
    { href: `/${locale}/products`, label: t("navAllProducts"), icon: NAV_ICONS[0] },
    { href: `/${locale}/brands`, label: t("navBrands"), icon: NAV_ICONS[1] },
    { href: `/${locale}/categories`, label: t("navCategories"), icon: NAV_ICONS[2] },
    { href: `/${locale}/products?isOnSale=true`, label: t("navOffers"), icon: NAV_ICONS[3] },
  ];

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="pb-16 space-y-10">
        {/* Hero */}
        <PageBlockRenderer locale={locale} types={["Hero"]} />

        {/* Quick navigation tiles */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {navTiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-accent transition-colors group"
              >
                <span className="text-text-muted group-hover:text-accent transition-colors">
                  {tile.icon}
                </span>
                <span className="text-sm font-medium text-text">{tile.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products swiper */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FeaturedProductsSwiper locale={locale} />
        </div>

        {/* Vehicle Strip */}
        <PageBlockRenderer locale={locale} types={["VehicleStrip"]} />

        {/* Best Sellers swiper */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <BestSellersSwiper locale={locale} />
        </div>

        {/* Category Grid */}
        <PageBlockRenderer locale={locale} types={["CategoryGrid"]} />

        {/* Brands strip */}
        <BrandsStripSection locale={locale} />

        {/* New Arrivals swiper */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <NewArrivalsSwiper locale={locale} />
        </div>

        {/* Remaining CMS blocks (ProductList + Banners) */}
        <PageBlockRenderer locale={locale} exclude={["Hero", "VehicleStrip", "CategoryGrid"]} />

        {/* On Sale swiper */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <OnSaleSwiper locale={locale} />
        </div>
      </main>
    </>
  );
}
