import { notFound } from "next/navigation";
import { Header } from "@/shared/ui/Header";
import { ProductGallery } from "@/modules/catalog/components/ProductGallery";
import { getProductBySlug } from "@/modules/catalog/actions/catalogActions";
import { AddToCartButton } from "@/modules/cart/components/AddToCartButton";

const CONDITION_LABELS: Record<string, string> = {
  Original: "قطعة أصلية",
  Aftermarket: "قطعة بديلة",
  Used: "مستعمل",
};

const CONDITION_COLORS: Record<string, string> = {
  Original: "bg-success/15 text-success",
  Aftermarket: "bg-warning/15 text-warning",
  Used: "bg-surface-alt text-text-muted",
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isPublished) notFound();

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-muted mb-6 flex items-center gap-2 flex-wrap" aria-label="التنقل">
          <a href={`/${locale}`} className="hover:text-text transition-colors">الرئيسية</a>
          <span>›</span>
          <a href={`/${locale}/categories/${product.category.slug}`} className="hover:text-text transition-colors">
            {product.category.name}
          </a>
          <span>›</span>
          <span className="text-text">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Gallery (MOTION 2: cross-fade on thumbnail click) */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Brand + condition */}
            <div className="flex items-center gap-3">
              {product.brand.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.brand.logoUrl}
                  alt={product.brand.name}
                  className="h-8 w-auto object-contain"
                />
              )}
              <span className="text-sm text-text-muted">{product.brand.name}</span>
              <span
                className={[
                  "px-2 py-0.5 rounded text-xs font-medium ms-auto",
                  CONDITION_COLORS[product.condition] ?? "bg-surface-alt text-text-muted",
                ].join(" ")}
              >
                {CONDITION_LABELS[product.condition] ?? product.condition}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-text leading-snug">{product.name}</h1>

            {/* SKU / OEM */}
            <div className="flex flex-wrap gap-4 text-sm" dir="ltr">
              <span className="text-text-muted">
                SKU: <span className="font-mono text-text">{product.sku}</span>
              </span>
              {product.oemNumber && (
                <span className="text-text-muted">
                  OEM: <span className="font-mono text-text">{product.oemNumber}</span>
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-accent" dir="ltr">
                {product.priceAmount.toFixed(2)}
              </span>
              <span className="text-lg text-text-muted">{product.priceCurrency}</span>
            </div>

            {/* Stock indicator */}
            <p className={product.stock > 0 ? "text-success text-sm" : "text-danger text-sm"}>
              {product.stock > 0
                ? `متوفر في المخزون (${product.stock} قطعة)`
                : "نفد من المخزون"}
            </p>

            {/* Add to cart */}
            <AddToCartButton
              product={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: product.priceAmount,
                stock: product.stock,
                imageUrl: product.images[0]?.url ?? null,
              }}
              className="w-full h-12 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors text-base"
            />

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-border">
                <h2 className="text-sm font-medium text-text mb-2">الوصف</h2>
                <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Fitments */}
            {product.fitments.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h2 className="text-sm font-medium text-text mb-3">تتوافق مع السيارات التالية</h2>
                <ul className="space-y-1.5">
                  {product.fitments.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm text-text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {f.modelName}{" "}
                      <span className="text-xs" dir="ltr">
                        ({f.yearFrom}–{f.yearTo})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} | PartZone` : "منتج",
    description: product?.description ?? undefined,
  };
}
