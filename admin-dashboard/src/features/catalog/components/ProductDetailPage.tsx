import { useQuery, useMutation } from "@apollo/client";
import { useParams, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  GET_PRODUCT_BY_ID,
  UPDATE_PRODUCT,
  PUBLISH_PRODUCT,
  UNPUBLISH_PRODUCT,
} from "../graphql/catalogApi";
import { ProductDetail } from "../products/types";
import { FlagToggle } from "../shared/FlagToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductDetailPage() {
  const params = useParams({ strict: false }) as { productId?: string };
  const router = useRouter();
  const productId = params.productId ?? "";

  const { data, loading, refetch } = useQuery<{ productById: ProductDetail | null }>(
    GET_PRODUCT_BY_ID,
    { variables: { id: productId }, skip: !productId }
  );

  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [publishProduct] = useMutation(PUBLISH_PRODUCT);
  const [unpublishProduct] = useMutation(UNPUBLISH_PRODUCT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useLanguage();
  const product = data?.productById;

  const setFlag = async (flag: "isFeatured" | "isBestSeller" | "isNew" | "isOnSale", value: boolean) => {
    if (!product) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateProduct({
        variables: {
          input: {
            productId: product.id,
            [flag]: value,
          },
        },
      });
      const errs = result.data?.updateProduct?.errors ?? [];
      if (errs.length) setError(errs[0]);
      else refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async () => {
    if (!product) return;
    setBusy(true);
    setError(null);
    try {
      const mutation = product.isPublished ? unpublishProduct : publishProduct;
      await mutation({ variables: { productId: product.id } });
      refetch();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">{t("loading")}</div>;
  if (!product) return <div className="p-8 text-error">{t("productNotFound")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.history.back()}
        className="text-sm text-accent hover:underline"
      >
        {t("back")}
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text">{product.name}</h1>
            <p className="text-sm text-text-muted mt-1">
              {product.sku} · {product.brand.name} · {product.category.name}
            </p>
          </div>
          {product.images.find(i => i.isPrimary)?.url && (
            <img
              src={product.images.find(i => i.isPrimary)!.url}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg border border-border"
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-surface-alt rounded-lg p-3">
            <p className="text-text-muted text-xs mb-1">{t("priceLabel")}</p>
            <p className="font-semibold text-text">{product.priceAmount} {product.priceCurrency}</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3">
            <p className="text-text-muted text-xs mb-1">{t("stockLabel")}</p>
            <p className="font-semibold text-text">{product.stock}</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3">
            <p className="text-text-muted text-xs mb-1">{t("conditionLabel")}</p>
            <p className="font-semibold text-text">{product.condition}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">{t("flagsSection")}</h2>
        <div className="divide-y divide-border">
          <FlagToggle
            label={t("flagFeaturedProduct")}
            checked={product.isFeatured}
            busy={busy}
            onChange={(v) => setFlag("isFeatured", v)}
          />
          <FlagToggle
            label={t("flagBestSeller")}
            checked={product.isBestSeller}
            busy={busy}
            onChange={(v) => setFlag("isBestSeller", v)}
          />
          <FlagToggle
            label={t("flagNew")}
            checked={product.isNew}
            busy={busy}
            onChange={(v) => setFlag("isNew", v)}
          />
          <FlagToggle
            label={t("flagOnSale")}
            checked={product.isOnSale}
            busy={busy}
            onChange={(v) => setFlag("isOnSale", v)}
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">{t("publishSection")}</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {product.isPublished ? t("publishedDesc") : t("draftDesc")}
          </span>
          <button
            onClick={togglePublish}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              product.isPublished
                ? "bg-warning/15 text-warning hover:bg-warning/25"
                : "bg-success/15 text-success hover:bg-success/25"
            }`}
          >
            {product.isPublished ? t("unpublishBtn") : t("publishBtn")}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3 text-sm text-error">
          {error}
        </div>
      )}
    </div>
  );
}
