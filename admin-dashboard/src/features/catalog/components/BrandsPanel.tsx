import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GET_BRANDS,
  CREATE_BRAND,
  UPDATE_BRAND,
} from "../graphql/catalogApi";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const brandSchema = z.object({
  name: z.string().min(1, "مطلوب").max(200),
  slug: z.string().min(1, "مطلوب").max(200).regex(/^[a-z0-9-]+$/, "lowercase, أرقام، شرطات فقط"),
  logoUrl: z.string().url("رابط غير صالح").nullish().or(z.literal("")),
});
type BrandForm = z.infer<typeof brandSchema>;

// ── Components ────────────────────────────────────────────────────────────────

function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          "fixed top-0 end-0 h-full w-96 bg-surface border-s border-border z-50",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        ].join(" ")}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <h2 className="font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
      </aside>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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

// ── BrandForm ─────────────────────────────────────────────────────────────────

function BrandFormDrawer({
  editing,
  onClose,
  onDone,
}: {
  editing: Brand | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const isEdit = editing !== null;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: editing
      ? { name: editing.name, slug: editing.slug, logoUrl: editing.logoUrl ?? "" }
      : { name: "", slug: "", logoUrl: "" },
  });

  const [createBrand] = useMutation(CREATE_BRAND, {
    refetchQueries: [{ query: GET_BRANDS }],
  });
  const [updateBrand] = useMutation(UPDATE_BRAND, {
    refetchQueries: [{ query: GET_BRANDS }],
  });

  const onSubmit = async (data: BrandForm) => {
    setServerError(null);
    const logoUrl = data.logoUrl || null;
    try {
      if (isEdit) {
        const res = await updateBrand({
          variables: { input: { id: editing!.id, name: data.name, logoUrl } },
        });
        if (res.data?.updateBrand.errors?.length)
          return setServerError(res.data.updateBrand.errors[0]);
      } else {
        const res = await createBrand({
          variables: { input: { name: data.name, slug: data.slug, logoUrl } },
        });
        if (res.data?.createBrand.errors?.length)
          return setServerError(res.data.createBrand.errors[0]);
      }
      onDone();
    } catch (e: unknown) {
      setServerError((e as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir="rtl">
      <Field label="الاسم" error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder="تويوتا" />
      </Field>
      <Field label="الـ Slug" error={errors.slug?.message}>
        <input
          {...register("slug")}
          className={inputCls}
          placeholder="toyota"
          disabled={isEdit}
          dir="ltr"
        />
      </Field>
      <Field label="رابط الشعار (اختياري)" error={errors.logoUrl?.message}>
        <input {...register("logoUrl")} className={inputCls} placeholder="https://…" dir="ltr" />
      </Field>
      {serverError && (
        <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>
      )}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ…" : isEdit ? "حفظ التعديلات" : "إضافة"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function BrandsPanel() {
  const { data, loading, error } = useQuery(GET_BRANDS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  const brands: Brand[] = data?.brands ?? [];

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  if (error)
    return (
      <p className="text-danger text-sm">خطأ في تحميل الماركات: {error.message}</p>
    );

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text">الماركات</h2>
        <button
          onClick={openCreate}
          className="bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          + إضافة ماركة
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-surface-alt rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-right">
              <th className="pb-3 font-medium pe-4">الاسم</th>
              <th className="pb-3 font-medium pe-4">Slug</th>
              <th className="pb-3 font-medium pe-4">الحالة</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {brands.map((b) => (
              <tr key={b.id} className="group hover:bg-surface-alt transition-colors">
                <td className="py-3 pe-4 font-medium text-text">
                  <div className="flex items-center gap-2">
                    {b.logoUrl && (
                      <img
                        src={b.logoUrl}
                        alt=""
                        className="w-6 h-6 object-contain rounded"
                      />
                    )}
                    {b.name}
                  </div>
                </td>
                <td className="py-3 pe-4 text-text-muted font-mono" dir="ltr">
                  {b.slug}
                </td>
                <td className="py-3 pe-4">
                  <span
                    className={[
                      "px-2 py-0.5 rounded text-xs font-medium",
                      b.isActive
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger",
                    ].join(" ")}
                  >
                    {b.isActive ? "مفعّل" : "معطّل"}
                  </span>
                </td>
                <td className="py-3 text-end">
                  <button
                    onClick={() => openEdit(b)}
                    className="text-xs text-text-muted hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                  >
                    تعديل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Drawer
        open={drawerOpen}
        title={editing ? "تعديل ماركة" : "إضافة ماركة جديدة"}
        onClose={closeDrawer}
      >
        <BrandFormDrawer
          editing={editing}
          onClose={closeDrawer}
          onDone={closeDrawer}
        />
      </Drawer>
    </div>
  );
}
