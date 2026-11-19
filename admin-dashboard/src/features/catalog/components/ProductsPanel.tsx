import { useState, useEffect, useRef } from "react";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/upload";
import { useQuery, useMutation } from "@apollo/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import {
  GET_PRODUCTS,
  GET_BRANDS,
  GET_CATEGORIES,
  GET_PRODUCT_BY_SLUG,
  PUBLISH_PRODUCT,
  UNPUBLISH_PRODUCT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  ADD_PRODUCT_IMAGE,
  REMOVE_PRODUCT_IMAGE,
  SET_PRIMARY_PRODUCT_IMAGE,
  DELETE_PRODUCT,
} from "../graphql/catalogApi";
import { ProductSummary, PagedResult, ProductImage } from "../products/types";
import { productSchema, ProductForm, editProductSchema, EditProductForm } from "../products/validation";
import { CONDITION_COLORS } from "../products/utils";
import { Drawer } from "../shared/Drawer";
import { Field } from "../shared/Field";
import { inputCls } from "../shared/styles";
import { useLanguage } from "@/contexts/LanguageContext";

function CreateProductDrawer({
  onClose, onDone, brands, categories,
}: {
  onClose: () => void;
  onDone: () => void;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const { t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: ["GetProducts"],
    awaitRefetchQueries: true,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { oemNumber: "", descriptionAr: "", nameEn: "", priceCurrency: "EGP", stock: 0 },
  });

  const onSubmit = async (data: ProductForm) => {
    setServerError(null);
    const translations = [{ locale: "ar", name: data.nameAr, description: data.descriptionAr || null }];
    if (data.nameEn) translations.push({ locale: "en", name: data.nameEn, description: null });

    const { data: result, errors: gqlErrors } = await createProduct({
      variables: {
        input: {
          sku: data.sku,
          oemNumber: data.oemNumber || "",
          slug: data.slug,
          condition: data.condition,
          priceAmount: data.priceAmount,
          priceCurrency: data.priceCurrency,
          stock: data.stock,
          brandId: data.brandId,
          categoryId: data.categoryId,
          translations,
        },
      },
    });

    if (gqlErrors?.length) {
      setServerError(gqlErrors[0]?.message ?? t("errorUnknown"));
      return;
    }
    const payload = result?.createProduct;
    if (payload?.errors?.length) {
      setServerError(payload.errors[0]);
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="SKU" error={errors.sku?.message}>
          <input {...register("sku")} className={inputCls} placeholder="BOSCH-0001" dir="ltr" />
        </Field>
        <Field label={t("fieldOem")} error={errors.oemNumber?.message}>
          <input {...register("oemNumber")} className={inputCls} dir="ltr" />
        </Field>
      </div>

      <Field label={t("fieldSlugProduct")} error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="bosch-brake-pad-0001" dir="ltr" />
      </Field>

      <Field label={t("fieldNameAr")} error={errors.nameAr?.message}>
        <input {...register("nameAr")} className={inputCls} />
      </Field>

      <Field label={t("fieldDescAr")} error={errors.descriptionAr?.message}>
        <textarea {...register("descriptionAr")} rows={2} className={inputCls} />
      </Field>

      <Field label={t("fieldNameEn")} error={errors.nameEn?.message}>
        <input {...register("nameEn")} className={inputCls} dir="ltr" />
      </Field>

      <Field label={t("fieldCondition")} error={errors.condition?.message}>
        <select {...register("condition")} className={inputCls}>
          <option value="">{t("conditionSelect")}</option>
          <option value="Original">{t("conditionOriginal")}</option>
          <option value="Aftermarket">{t("conditionAftermarket")}</option>
          <option value="Used">{t("conditionUsed")}</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label={t("fieldBrand")} error={errors.brandId?.message}>
          <select {...register("brandId")} className={inputCls}>
            <option value="">{t("conditionSelect")}</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label={t("fieldCategory")} error={errors.categoryId?.message}>
          <select {...register("categoryId")} className={inputCls}>
            <option value="">{t("conditionSelect")}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label={t("fieldPrice")} error={errors.priceAmount?.message}>
          <input type="number" step="0.01" {...register("priceAmount")} className={inputCls} placeholder="0.00" dir="ltr" />
        </Field>
        <Field label={t("fieldCurrency")} error={errors.priceCurrency?.message}>
          <input {...register("priceCurrency")} className={inputCls} placeholder="EGP" dir="ltr" />
        </Field>
      </div>

      <Field label={t("fieldInitialStock")} error={errors.stock?.message}>
        <input type="number" {...register("stock")} className={inputCls} placeholder="0" dir="ltr" />
      </Field>

      {serverError && <p className="text-danger text-xs mb-4">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-accent text-white rounded-md py-2 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t("saving") : t("createProduct")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-surface-alt text-text rounded-md py-2 text-sm font-medium hover:bg-border transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

function ProductImagesSection({ productId, images }: { productId: string; images: ProductImage[] }) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opts = { refetchQueries: ["GetProducts"] };
  const [addImage] = useMutation(ADD_PRODUCT_IMAGE, opts);
  const [removeImage] = useMutation(REMOVE_PRODUCT_IMAGE, opts);
  const [setPrimary] = useMutation(SET_PRIMARY_PRODUCT_IMAGE, opts);

  const run = async (fn: () => Promise<{ data?: Record<string, { errors?: string[] } | null> | null }>) => {
    setError(null);
    try {
      const res = await fn();
      const payload = res.data && Object.values(res.data)[0];
      if (payload?.errors?.length) setError(payload.errors[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorUnknown"));
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        await run(() => addImage({ variables: { input: { productId, url, altText: file.name } } }));
      } catch (e) {
        setError(e instanceof Error ? e.message : t("imageUploadFail"));
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text-muted">{t("productImages")}</p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 bg-accent text-white rounded text-xs font-medium hover:bg-accent/90 disabled:opacity-50"
        >
          {uploading ? t("uploading") : t("uploadImage")}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-text-muted py-4 text-center bg-surface-alt rounded">
          {t("noImages")}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded overflow-hidden border border-border">
              <img src={img.url} alt={img.altText ?? ""} className="w-full aspect-square object-cover bg-product-bg" />
              {img.isPrimary && (
                <span className="absolute top-1 start-1 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded">{t("primaryImage")}</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => run(() => setPrimary({ variables: { productId, imageId: img.id } }))}
                    className="text-[10px] text-white hover:text-accent"
                  >
                    {t("setPrimary")}
                  </button>
                ) : <span />}
                <button
                  type="button"
                  onClick={() => run(() => removeImage({ variables: { productId, imageId: img.id } }))}
                  className="text-[10px] text-white hover:text-danger"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function EditProductDrawer({
  product, onClose, onDone, brands, categories,
}: {
  product: ProductSummary;
  onClose: () => void;
  onDone: () => void;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const { t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: ["GetProducts"],
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      slug: product.slug,
      nameAr: product.name,
      descriptionAr: "",
      nameEn: "",
      condition: product.condition as EditProductForm["condition"],
      brandId: product.brandId,
      categoryId: product.categoryId,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
    },
  });

  const { data: detailData, loading: detailLoading } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug: product.slug },
  });

  useEffect(() => {
    if (detailData?.product) {
      setValue("descriptionAr", detailData.product.description ?? "");
    }
  }, [detailData, setValue]);

  const onSubmit = async (data: EditProductForm) => {
    setServerError(null);
    const translations = [{ locale: "ar", name: data.nameAr, description: data.descriptionAr || null }];
    if (data.nameEn) translations.push({ locale: "en", name: data.nameEn, description: null });

    const { data: result, errors: gqlErrors } = await updateProduct({
      variables: {
        input: {
          productId: product.id,
          slug: data.slug,
          condition: data.condition,
          priceAmount: data.priceAmount,
          priceCurrency: data.priceCurrency,
          brandId: data.brandId,
          categoryId: data.categoryId,
          translations,
        },
      },
    });

    if (gqlErrors?.length) { setServerError(gqlErrors[0]?.message ?? t("errorUnknown")); return; }
    const payload = result?.updateProduct;
    if (payload?.errors?.length) { setServerError(payload.errors[0]); return; }
    onDone();
  };

  return (
    <>
    <ProductImagesSection productId={product.id} images={detailData?.product?.images ?? []} />
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label={t("fieldSlugProduct")} error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} dir="ltr" />
      </Field>

      <Field label={t("fieldNameAr")} error={errors.nameAr?.message}>
        <input {...register("nameAr")} className={inputCls} />
      </Field>

      <Field label={t("fieldDescAr")} error={errors.descriptionAr?.message}>
        <textarea {...register("descriptionAr")} rows={2} className={inputCls} />
      </Field>

      <Field label={t("fieldNameEn")} error={errors.nameEn?.message}>
        <input {...register("nameEn")} className={inputCls} dir="ltr" />
      </Field>

      <Field label={t("fieldCondition")} error={errors.condition?.message}>
        <select {...register("condition")} className={inputCls}>
          <option value="Original">{t("conditionOriginal")}</option>
          <option value="Aftermarket">{t("conditionAftermarket")}</option>
          <option value="Used">{t("conditionUsed")}</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label={t("fieldBrand")} error={errors.brandId?.message}>
          <select {...register("brandId")} className={inputCls}>
            <option value="">{t("conditionSelect")}</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label={t("fieldCategory")} error={errors.categoryId?.message}>
          <select {...register("categoryId")} className={inputCls}>
            <option value="">{t("conditionSelect")}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label={t("fieldPrice")} error={errors.priceAmount?.message}>
          <input type="number" step="0.01" {...register("priceAmount")} className={inputCls} dir="ltr" />
        </Field>
        <Field label={t("fieldCurrency")} error={errors.priceCurrency?.message}>
          <input {...register("priceCurrency")} className={inputCls} dir="ltr" />
        </Field>
      </div>

      {serverError && <p className="text-danger text-xs mb-4">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || detailLoading}
          className="flex-1 bg-accent text-white rounded-md py-2 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t("saving") : t("saveChanges")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-surface-alt text-text rounded-md py-2 text-sm font-medium hover:bg-border transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6" dir="ltr">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 text-sm border border-border rounded disabled:opacity-40 hover:bg-surface-alt text-text transition-colors"
      >
        ←
      </button>
      <span className="text-sm text-text-muted">
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 text-sm border border-border rounded disabled:opacity-40 hover:bg-surface-alt text-text transition-colors"
      >
        →
      </button>
    </div>
  );
}

export function ProductsPanel() {
  const { t, dir } = useLanguage();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductSummary | null>(null);

  const filter = {
    q: q || null,
    categoryId: categoryId || null,
    brandId: brandId || null,
    condition: condition || null,
    page,
    pageSize: 20,
  };

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });
  const { data: brandsData } = useQuery(GET_BRANDS);
  const { data: catsData } = useQuery(GET_CATEGORIES);

  const [publishProduct] = useMutation(PUBLISH_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS, variables: { filter } }],
  });
  const [unpublishProduct] = useMutation(UNPUBLISH_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS, variables: { filter } }],
  });
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS, variables: { filter } }],
  });

  const paged: PagedResult | undefined = data?.products;

  const togglePublish = async (p: ProductSummary) => {
    if (p.isPublished) {
      await unpublishProduct({ variables: { productId: p.id } });
    } else {
      await publishProduct({ variables: { productId: p.id } });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirmProduct"))) return;
    await deleteProduct({ variables: { id } });
  };

  const resetFilters = () => {
    setQ("");
    setCategoryId(null);
    setBrandId(null);
    setCondition(null);
    setPage(1);
  };

  const hasFilters = q || categoryId || brandId || condition;

  const selectCls =
    "bg-surface-alt border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors";

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">{t("productsHeading")}</h2>
        <div className="flex items-center gap-3">
          {paged && (
            <span className="text-sm text-text-muted">{paged.totalCount}</span>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            {t("newProduct")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-surface-alt rounded-lg border border-border">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder={t("searchPlaceholder")}
          className="flex-1 min-w-48 bg-surface border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <select
          value={brandId ?? ""}
          onChange={(e) => { setBrandId(e.target.value || null); setPage(1); }}
          className={selectCls}
        >
          <option value="">{t("filterAllBrands")}</option>
          {brandsData?.brands.map((b: { id: string; name: string }) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={categoryId ?? ""}
          onChange={(e) => { setCategoryId(e.target.value || null); setPage(1); }}
          className={selectCls}
        >
          <option value="">{t("filterAllCategories")}</option>
          {catsData?.categories.map((c: { id: string; name: string }) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={condition ?? ""}
          onChange={(e) => { setCondition(e.target.value || null); setPage(1); }}
          className={selectCls}
        >
          <option value="">{t("filterAllConditions")}</option>
          <option value="Original">{t("conditionOriginal")}</option>
          <option value="Aftermarket">{t("conditionAftermarket")}</option>
          <option value="Used">{t("conditionUsed")}</option>
        </select>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-text-muted hover:text-danger transition-colors"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      {error && (
        <p className="text-danger text-sm mb-4">{t("errorUnknown")}: {error.message}</p>
      )}

      {loading && !paged ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-14 bg-surface-alt rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-right">
                <th className="pb-3 font-medium pe-3 w-16">{t("tableColImage")}</th>
                <th className="pb-3 font-medium pe-4">{t("tableColProduct")}</th>
                <th className="pb-3 font-medium pe-4">SKU</th>
                <th className="pb-3 font-medium pe-4">{t("tableColCategory")}</th>
                <th className="pb-3 font-medium pe-4">{t("tableColPrice")}</th>
                <th className="pb-3 font-medium pe-4">{t("tableColStock")}</th>
                <th className="pb-3 font-medium pe-4">{t("tableColCondition")}</th>
                <th className="pb-3 font-medium pe-4">{t("tableColPublish")}</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged?.items.map((p) => (
                <tr key={p.id} className="group hover:bg-surface-alt/50 transition-colors">
                  <td className="py-3 pe-3">
                    {p.primaryImageUrl ? (
                      <img
                        src={p.primaryImageUrl}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded bg-product-bg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-product-bg" />
                    )}
                  </td>
                  <td className="py-3 pe-4">
                    <p className="font-medium text-text">{p.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{p.brandName}</p>
                  </td>
                  <td className="py-3 pe-4 font-mono text-text-muted text-xs" dir="ltr">
                    {p.sku}
                  </td>
                  <td className="py-3 pe-4 text-text-muted text-xs">{p.categoryName}</td>
                  <td className="py-3 pe-4 text-text" dir="ltr">
                    {p.priceAmount.toFixed(2)} {p.priceCurrency}
                  </td>
                  <td className="py-3 pe-4">
                    <span className={p.stock > 0 ? "text-success" : "text-danger"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 pe-4">
                    <span
                      className={[
                        "px-2 py-0.5 rounded text-xs font-medium",
                        CONDITION_COLORS[p.condition] ?? "bg-surface-alt text-text-muted",
                      ].join(" ")}
                    >
                      {p.condition === "Original" ? t("conditionOriginal") : p.condition === "Aftermarket" ? t("conditionAftermarket") : p.condition === "Used" ? t("conditionUsed") : p.condition}
                    </span>
                  </td>
                  <td className="py-3 pe-4">
                    <button
                      onClick={() => togglePublish(p)}
                      className={[
                        "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                        p.isPublished
                          ? "bg-success/15 text-success hover:bg-danger/15 hover:text-danger"
                          : "bg-surface-alt text-text-muted hover:bg-success/15 hover:text-success",
                      ].join(" ")}
                    >
                      {p.isPublished ? t("published") : t("draft")}
                    </button>
                  </td>
                  <td className="py-3 text-end pe-2">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        type="button"
                        onClick={() => setEditProduct(p)}
                        className="text-xs text-text-muted hover:text-accent"
                      >
                        {t("edit")}
                      </button>
                      <Link
                        to="/catalog/products/$productId"
                        params={{ productId: p.id }}
                        className="text-xs text-accent hover:underline"
                      >
                        {t("details")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-danger hover:text-danger/70 transition-colors"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged && (
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}

      <Drawer open={drawerOpen} title={t("drawerNewProduct")} onClose={() => setDrawerOpen(false)} asideClassName="w-[32rem]">
        {drawerOpen && (
          <CreateProductDrawer
            brands={brandsData?.brands ?? []}
            categories={catsData?.categories ?? []}
            onClose={() => setDrawerOpen(false)}
            onDone={() => {
              setDrawerOpen(false);
              setPage((p) => p);
            }}
          />
        )}
      </Drawer>

      <Drawer open={editProduct !== null} title={t("drawerEditProduct")} onClose={() => setEditProduct(null)} asideClassName="w-[32rem]">
        {editProduct && (
          <EditProductDrawer
            product={editProduct}
            brands={brandsData?.brands ?? []}
            categories={catsData?.categories ?? []}
            onClose={() => setEditProduct(null)}
            onDone={() => {
              setEditProduct(null);
              setPage((p) => p);
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
