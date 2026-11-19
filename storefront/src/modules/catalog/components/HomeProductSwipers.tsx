import { getTranslations } from "next-intl/server";
import { getProducts } from "../actions/catalogActions";
import { ProductSwiper } from "./ProductSwiper";

const SWIPER_PAGE_SIZE = 12;

interface SwiperProps { locale?: string }

export async function FeaturedProductsSwiper({ locale = "ar" }: SwiperProps = {}) {
  const [result, t] = await Promise.all([
    getProducts({ isFeatured: true, pageSize: SWIPER_PAGE_SIZE }),
    getTranslations({ locale, namespace: "home" }),
  ]);
  if (result.items.length === 0) return null;
  return (
    <ProductSwiper
      title={t("featured")}
      products={result.items}
      viewAllHref={`/${locale}/products?isFeatured=true`}
    />
  );
}

export async function BestSellersSwiper({ locale = "ar" }: SwiperProps = {}) {
  const [result, t] = await Promise.all([
    getProducts({ isBestSeller: true, pageSize: SWIPER_PAGE_SIZE }),
    getTranslations({ locale, namespace: "home" }),
  ]);
  if (result.items.length === 0) return null;
  return (
    <ProductSwiper
      title={t("bestSellers")}
      products={result.items}
      viewAllHref={`/${locale}/products?isBestSeller=true`}
    />
  );
}

export async function NewArrivalsSwiper({ locale = "ar" }: SwiperProps = {}) {
  const [result, t] = await Promise.all([
    getProducts({ isNew: true, pageSize: SWIPER_PAGE_SIZE }),
    getTranslations({ locale, namespace: "home" }),
  ]);
  if (result.items.length === 0) return null;
  return (
    <ProductSwiper
      title={t("newArrivals")}
      products={result.items}
      viewAllHref={`/${locale}/products?isNew=true`}
    />
  );
}

export async function OnSaleSwiper({ locale = "ar" }: SwiperProps = {}) {
  const [result, t] = await Promise.all([
    getProducts({ isOnSale: true, pageSize: SWIPER_PAGE_SIZE }),
    getTranslations({ locale, namespace: "home" }),
  ]);
  if (result.items.length === 0) return null;
  return (
    <ProductSwiper
      title={t("onSale")}
      products={result.items}
      viewAllHref={`/${locale}/products?isOnSale=true`}
    />
  );
}

export async function HomeProductSwipers({ locale = "ar" }: SwiperProps = {}) {
  const [featured, bestSellers, newArrivals, onSale, t] = await Promise.all([
    getProducts({ isFeatured: true,   pageSize: SWIPER_PAGE_SIZE }),
    getProducts({ isBestSeller: true, pageSize: SWIPER_PAGE_SIZE }),
    getProducts({ isNew: true,        pageSize: SWIPER_PAGE_SIZE }),
    getProducts({ isOnSale: true,     pageSize: SWIPER_PAGE_SIZE }),
    getTranslations({ locale, namespace: "home" }),
  ]);

  return (
    <div className="space-y-10">
      <ProductSwiper title={t("featured")}     products={featured.items} />
      <ProductSwiper title={t("bestSellers")}  products={bestSellers.items} />
      <ProductSwiper title={t("newArrivals")}  products={newArrivals.items} />
      <ProductSwiper title={t("onSale")}       products={onSale.items} />
    </div>
  );
}
