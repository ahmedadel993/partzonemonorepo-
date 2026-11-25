import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  ACTIVATE_CATEGORY,
  DEACTIVATE_CATEGORY,
} from "../graphql/catalogApi";
import { Category } from "../categories/types";
import { categorySchema, CategoryForm } from "../categories/validation";
import { Drawer } from "../shared/Drawer";
import { Field } from "../shared/Field";
import { inputCls } from "../shared/styles";
import { useLanguage } from "@/contexts/LanguageContext";

function CategoryFormDrawer({
  editing, onClose, onDone,
}: { editing: Category | null; onClose: () => void; onDone: () => void }) {
  const { t, dir } = useLanguage();
  const isEdit = editing !== null;
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: editing
      ? { name: editing.name, slug: editing.slug, imageUrl: editing.imageUrl ?? "", sortOrder: editing.sortOrder }
      : { name: "", slug: "", imageUrl: "", sortOrder: 0 },
  });

  const [createCategory] = useMutation(CREATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }], awaitRefetchQueries: true });
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
          variables: { input: { name: data.name, slug: data.slug, iconUrl: imageUrl, sortOrder: data.sortOrder } },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir={dir}>
      <Field label={t("fieldName")} error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder={t("categoryNamePlaceholder")} />
      </Field>
      <Field label={t("fieldSlug")} error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="engine-parts" disabled={isEdit} dir="ltr" />
      </Field>
      <Field label={t("fieldImageUrl")} error={errors.imageUrl?.message}>
        <input {...register("imageUrl")} className={inputCls} placeholder="https://…" dir="ltr" />
      </Field>
      <Field label={t("fieldSortOrder")} error={errors.sortOrder?.message}>
        <input {...register("sortOrder")} type="number" min={0} className={inputCls} dir="ltr" />
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
          {isSubmitting ? t("saving") : isEdit ? t("saveEdits") : t("add")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

export function CategoriesPanel() {
  const { t, dir } = useLanguage();
  const { data, loading, error } = useQuery(GET_CATEGORIES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteCategory] = useMutation(DELETE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }], awaitRefetchQueries: true });
  const [activateCategory] = useMutation(ACTIVATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });
  const [deactivateCategory] = useMutation(DEACTIVATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });

  const categories: Category[] = data?.categories ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirmCategory"))) return;
    await deleteCategory({ variables: { id } });
  };

  if (error)
    return <p className="text-danger text-sm">{t("errorLoadCategories")}: {error.message}</p>;

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text">{t("categoriesHeading")}</h2>
        <button
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          className="bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {t("addCategory")}
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
              <th className="pb-3 font-medium pe-4">{t("fieldName")}</th>
              <th className="pb-3 font-medium pe-4">Slug</th>
              <th className="pb-3 font-medium pe-4">{t("fieldSortOrder")}</th>
              <th className="pb-3 font-medium pe-4">{t("tableStatus")}</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id} className="group hover:bg-surface-alt transition-colors">
                <td className="py-3 pe-4 font-medium text-text">{c.name}</td>
                <td className="py-3 pe-4 text-text-muted font-mono" dir="ltr">{c.slug}</td>
                <td className="py-3 pe-4 text-text-muted">{c.sortOrder}</td>
                <td className="py-3 pe-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? "bg-success/15 text-success" : "bg-surface-alt text-text-muted"}`}>
                    {c.isActive ? t("userStatusActive") : t("userStatusInactive")}
                  </span>
                </td>
                <td className="py-3 text-end">
                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => { setEditing(c); setDrawerOpen(true); }}
                      className="text-xs text-text-muted hover:text-accent transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <Link
                      to="/catalog/categories/$categoryId"
                      params={{ categoryId: c.id }}
                      className="text-xs text-accent hover:underline"
                    >
                      {t("details")}
                    </Link>
                    {c.isActive ? (
                      <button
                        onClick={() => deactivateCategory({ variables: { id: c.id } })}
                        className="text-xs text-text-muted hover:text-danger transition-colors"
                      >
                        {t("actionDeactivate")}
                      </button>
                    ) : (
                      <button
                        onClick={() => activateCategory({ variables: { id: c.id } })}
                        className="text-xs text-text-muted hover:text-success transition-colors"
                      >
                        {t("actionActivate")}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
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
      )}

      <Drawer
        open={drawerOpen}
        title={editing ? t("drawerEditCategory") : t("drawerNewCategory")}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerOpen && (
          <CategoryFormDrawer
            editing={editing}
            onClose={() => setDrawerOpen(false)}
            onDone={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>
    </div>
  );
}
