import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
} from "../graphql/catalogApi";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
}

const categorySchema = z.object({
  name: z.string().min(1, "مطلوب").max(200),
  slug: z.string().min(1, "مطلوب").max(200).regex(/^[a-z0-9-]+$/, "lowercase, أرقام، شرطات فقط"),
  imageUrl: z.string().url("رابط غير صالح").nullish().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
});
type CategoryForm = z.infer<typeof categorySchema>;

function Drawer({
  open, title, onClose, children,
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <aside className={[
        "fixed top-0 end-0 h-full w-96 bg-surface border-s border-border z-50",
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

function CategoryFormDrawer({
  editing, onClose, onDone,
}: { editing: Category | null; onClose: () => void; onDone: () => void }) {
  const isEdit = editing !== null;
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: editing
      ? { name: editing.name, slug: editing.slug, imageUrl: editing.imageUrl ?? "", sortOrder: editing.sortOrder }
      : { name: "", slug: "", imageUrl: "", sortOrder: 0 },
  });

  const [createCategory] = useMutation(CREATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });
  const [updateCategory] = useMutation(UPDATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });

  const onSubmit = async (data: CategoryForm) => {
    setServerError(null);
    const imageUrl = data.imageUrl || null;
    try {
      if (isEdit) {
        const res = await updateCategory({
          variables: { input: { id: editing!.id, name: data.name, imageUrl, sortOrder: data.sortOrder } },
        });
        if (res.data?.updateCategory.errors?.length)
          return setServerError(res.data.updateCategory.errors[0]);
      } else {
        const res = await createCategory({
          variables: { input: { name: data.name, slug: data.slug, imageUrl, sortOrder: data.sortOrder } },
        });
        if (res.data?.createCategory.errors?.length)
          return setServerError(res.data.createCategory.errors[0]);
      }
      onDone();
    } catch (e: unknown) {
      setServerError((e as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir="rtl">
      <Field label="الاسم" error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder="قطع غيار المحرك" />
      </Field>
      <Field label="الـ Slug" error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="engine-parts" disabled={isEdit} dir="ltr" />
      </Field>
      <Field label="رابط الصورة (اختياري)" error={errors.imageUrl?.message}>
        <input {...register("imageUrl")} className={inputCls} placeholder="https://…" dir="ltr" />
      </Field>
      <Field label="الترتيب" error={errors.sortOrder?.message}>
        <input {...register("sortOrder")} type="number" min={0} className={inputCls} />
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

export function CategoriesPanel() {
  const { data, loading, error } = useQuery(GET_CATEGORIES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const categories: Category[] = data?.categories ?? [];

  if (error)
    return <p className="text-danger text-sm">خطأ في تحميل الفئات: {error.message}</p>;

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text">الفئات</h2>
        <button
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          className="bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          + إضافة فئة
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-surface-alt rounded animate-pulse" />)}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-right">
              <th className="pb-3 font-medium pe-4">الاسم</th>
              <th className="pb-3 font-medium pe-4">Slug</th>
              <th className="pb-3 font-medium pe-4">الترتيب</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id} className="group hover:bg-surface-alt transition-colors">
                <td className="py-3 pe-4 font-medium text-text">{c.name}</td>
                <td className="py-3 pe-4 text-text-muted font-mono" dir="ltr">{c.slug}</td>
                <td className="py-3 pe-4 text-text-muted">{c.sortOrder}</td>
                <td className="py-3 text-end">
                  <button
                    onClick={() => { setEditing(c); setDrawerOpen(true); }}
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
        title={editing ? "تعديل فئة" : "إضافة فئة جديدة"}
        onClose={() => setDrawerOpen(false)}
      >
        <CategoryFormDrawer
          editing={editing}
          onClose={() => setDrawerOpen(false)}
          onDone={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}
