import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GET_PRODUCTS,
  GET_BRANDS,
  GET_CATEGORIES,
  GET_PRODUCT_BY_SLUG,
  PUBLISH_PRODUCT,
  UNPUBLISH_PRODUCT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
} from "../graphql/catalogApi";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductSummary {
  id: string;
  sku: string;
  slug: string;
  name: string;
  condition: string;
  priceAmount: number;
  priceCurrency: string;
  stock: number;
  isPublished: boolean;
  primaryImageUrl: string | null;
  brandName: string;
  categoryName: string;
  brandId: string;
  categoryId: string;
}

interface PagedResult {
  items: ProductSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const CONDITION_LABELS: Record<string, string> = {
  Original: "أصلي",
  Aftermarket: "بديل",
  Used: "مستعمل",
};

const CONDITION_COLORS: Record<string, string> = {
  Original: "bg-success/15 text-success",
  Aftermarket: "bg-warning/15 text-warning",
  Used: "bg-surface-alt text-text-muted",
};

// ── Create Product form ────────────────────────────────────────────────────────

function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <aside className={[
        "fixed top-0 end-0 h-full w-[32rem] bg-surface border-s border-border z-50",
        "transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
      ].join(" ")}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <h2 className="font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text text-xl leading-none">×</button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
      </aside>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-text-muted mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-surface-alt border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

const productSchema = z.object({
  sku:           z.string().min(1, "مطلوب").max(100),
  oemNumber:     z.string().max(100).default(""),
  slug:          z.string().min(1, "مطلوب").max(200).regex(/^[a-z0-9-]+$/, "lowercase، أرقام، شرطات فقط"),
  nameAr:        z.string().min(1, "مطلوب").max(300),
  descriptionAr: z.string().max(2000).default(""),
  nameEn:        z.string().max(300).default(""),
  condition:     z.enum(["Original", "Aftermarket", "Used"]),
  brandId:       z.string().uuid("اختر الماركة"),
  categoryId:    z.string().uuid("اختر الفئة"),
  priceAmount:   z.coerce.number().min(0.01, "السعر > 0"),
  priceCurrency: z.string().min(1).default("EGP"),
  stock:         z.coerce.number().int().min(0),
});
type ProductForm = z.infer<typeof productSchema>;

function CreateProductDrawer({
  onClose, onDone, brands, categories,
}: {
  onClose: () => void;
  onDone: () => void;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [createProduct] = useMutation(CREATE_PRODUCT);

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
      setServerError(gqlErrors[0].message);
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
        <Field label="رقم OEM" error={errors.oemNumber?.message}>
          <input {...register("oemNumber")} className={inputCls} placeholder="اختياري" dir="ltr" />
        </Field>
      </div>

      <Field label="Slug (الرابط)" error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="bosch-brake-pad-0001" dir="ltr" />
      </Field>

      <Field label="الاسم بالعربية" error={errors.nameAr?.message}>
        <input {...register("nameAr")} className={inputCls} placeholder="وسادة الفرامل بوش" />
      </Field>

      <Field label="وصف (عربي، اختياري)" error={errors.descriptionAr?.message}>
        <textarea {...register("descriptionAr")} rows={2} className={inputCls} placeholder="وصف المنتج…" />
      </Field>

      <Field label="الاسم بالإنجليزية (اختياري)" error={errors.nameEn?.message}>
        <input {...register("nameEn")} className={inputCls} placeholder="Bosch Brake Pad" dir="ltr" />
      </Field>

      <Field label="حالة القطعة" error={errors.condition?.message}>
        <select {...register("condition")} className={inputCls}>
          <option value="">— اختر —</option>
          <option value="Original">أصلي (Original)</option>
          <option value="Aftermarket">بديل (Aftermarket)</option>
          <option value="Used">مستعمل (Used)</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="الماركة" error={errors.brandId?.message}>
          <select {...register("brandId")} className={inputCls}>
            <option value="">— اختر —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="الفئة" error={errors.categoryId?.message}>
          <select {...register("categoryId")} className={inputCls}>
            <option value="">— اختر —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="السعر" error={errors.priceAmount?.message}>
          <input type="number" step="0.01" {...register("priceAmount")} className={inputCls} placeholder="0.00" dir="ltr" />
        </Field>
        <Field label="العملة" error={errors.priceCurrency?.message}>
          <input {...register("priceCurrency")} className={inputCls} placeholder="EGP" dir="ltr" />
        </Field>
      </div>

      <Field label="المخزون الابتدائي" error={errors.stock?.message}>
        <input type="number" {...register("stock")} className={inputCls} placeholder="0" dir="ltr" />
      </Field>

      {serverError && <p className="text-danger text-xs mb-4">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-accent text-white rounded-md py-2 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "جارٍ الحفظ…" : "إنشاء المنتج"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-surface-alt text-text rounded-md py-2 text-sm font-medium hover:bg-border transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ── Edit Product form ──────────────────────────────────────────────────────────

const editProductSchema = z.object({
  slug:          z.string().min(1, "مطلوب").max(200).regex(/^[a-z0-9-]+$/, "lowercase، أرقام، شرطات فقط"),
  nameAr:        z.string().min(1, "مطلوب").max(300),
  descriptionAr: z.string().max(2000).default(""),
  nameEn:        z.string().max(300).default(""),
  condition:     z.enum(["Original", "Aftermarket", "Used"]),
  brandId:       z.string().uuid("اختر الماركة"),
  categoryId:    z.string().uuid("اختر الفئة"),
  priceAmount:   z.coerce.number().min(0.01, "السعر > 0"),
  priceCurrency: z.string().min(1).default("EGP"),
});
type EditProductForm = z.infer<typeof editProductSchema>;

function EditProductDrawer({
  product, onClose, onDone, brands, categories,
}: {
  product: ProductSummary;
  onClose: () => void;
  onDone: () => void;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);

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

    if (gqlErrors?.length) { setServerError(gqlErrors[0].message); return; }
    const payload = result?.updateProduct;
    if (payload?.errors?.length) { setServerError(payload.errors[0]); return; }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="Slug (الرابط)" error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} dir="ltr" />
      </Field>

      <Field label="الاسم بالعربية" error={errors.nameAr?.message}>
        <input {...register("nameAr")} className={inputCls} />
      </Field>

      <Field label="وصف (عربي، اختياري)" error={errors.descriptionAr?.message}>
        <textarea {...register("descriptionAr")} rows={2} className={inputCls} />
      </Field>

      <Field label="الاسم بالإنجليزية (اختياري)" error={errors.nameEn?.message}>
        <input {...register("nameEn")} className={inputCls} dir="ltr" />
      </Field>

      <Field label="حالة القطعة" error={errors.condition?.message}>
        <select {...register("condition")} className={inputCls}>
          <option value="Original">أصلي (Original)</option>
          <option value="Aftermarket">بديل (Aftermarket)</option>
          <option value="Used">مستعمل (Used)</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="الماركة" error={errors.brandId?.message}>
          <select {...register("brandId")} className={inputCls}>
            <option value="">— اختر —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="الفئة" error={errors.categoryId?.message}>
          <select {...register("categoryId")} className={inputCls}>
            <option value="">— اختر —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="السعر" error={errors.priceAmount?.message}>
          <input type="number" step="0.01" {...register("priceAmount")} className={inputCls} dir="ltr" />
        </Field>
        <Field label="العملة" error={errors.priceCurrency?.message}>
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
          {isSubmitting ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-surface-alt text-text rounded-md py-2 text-sm font-medium hover:bg-border transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

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

// ── Main panel ────────────────────────────────────────────────────────────────

export function ProductsPanel() {
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

  const paged: PagedResult | undefined = data?.products;

  const togglePublish = async (p: ProductSummary) => {
    if (p.isPublished) {
      await unpublishProduct({ variables: { productId: p.id } });
    } else {
      await publishProduct({ variables: { productId: p.id } });
    }
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
    <div dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">المنتجات</h2>
        <div className="flex items-center gap-3">
          {paged && (
            <span className="text-sm text-text-muted">{paged.totalCount} منتج</span>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            + منتج جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-surface-alt rounded-lg border border-border">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="بحث بـ SKU أو الاسم…"
          className="flex-1 min-w-48 bg-surface border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <select
          value={brandId ?? ""}
          onChange={(e) => { setBrandId(e.target.value || null); setPage(1); }}
          className={selectCls}
        >
          <option value="">كل الماركات</option>
          {brandsData?.brands.map((b: { id: string; name: string }) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={categoryId ?? ""}
          onChange={(e) => { setCategoryId(e.target.value || null); setPage(1); }}
          className={selectCls}
        >
          <option value="">كل الفئات</option>
          {catsData?.categories.map((c: { id: string; name: string }) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={condition ?? ""}
          onChange={(e) => { setCondition(e.target.value || null); setPage(1); }}
          className={selectCls}
        >
          <option value="">كل الحالات</option>
          <option value="Original">أصلي</option>
          <option value="Aftermarket">بديل</option>
          <option value="Used">مستعمل</option>
        </select>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-text-muted hover:text-danger transition-colors"
          >
            مسح الفلاتر ×
          </button>
        )}
      </div>

      {error && (
        <p className="text-danger text-sm mb-4">خطأ: {error.message}</p>
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
                <th className="pb-3 font-medium pe-3 w-16">صورة</th>
                <th className="pb-3 font-medium pe-4">المنتج</th>
                <th className="pb-3 font-medium pe-4">SKU</th>
                <th className="pb-3 font-medium pe-4">الفئة</th>
                <th className="pb-3 font-medium pe-4">السعر</th>
                <th className="pb-3 font-medium pe-4">المخزون</th>
                <th className="pb-3 font-medium pe-4">الحالة</th>
                <th className="pb-3 font-medium pe-4">نشر</th>
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
                      {CONDITION_LABELS[p.condition] ?? p.condition}
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
                      {p.isPublished ? "منشور" : "مسودة"}
                    </button>
                  </td>
                  <td className="py-3 text-end pe-2">
                    <button
                      type="button"
                      onClick={() => setEditProduct(p)}
                      className="text-xs text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                    >
                      تعديل
                    </button>
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

      <Drawer open={drawerOpen} title="منتج جديد" onClose={() => setDrawerOpen(false)}>
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

      <Drawer open={editProduct !== null} title="تعديل المنتج" onClose={() => setEditProduct(null)}>
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
