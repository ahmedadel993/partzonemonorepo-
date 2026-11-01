import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_BRANDS,
  GET_CATEGORIES,
  PUBLISH_PRODUCT,
  UNPUBLISH_PRODUCT,
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
        {paged && (
          <span className="text-sm text-text-muted">
            {paged.totalCount} منتج
          </span>
        )}
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
                    <a
                      href={`/catalog/products/${p.slug}`}
                      className="text-xs text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                    >
                      تفاصيل
                    </a>
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
    </div>
  );
}
