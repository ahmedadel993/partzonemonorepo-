import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import {
  GET_BRANDS,
  CREATE_BRAND,
  UPDATE_BRAND,
  DELETE_BRAND,
} from "../graphql/catalogApi";
import { Brand } from "../brands/types";
import { brandSchema, BrandForm } from "../brands/validation";
import { Drawer } from "../shared/Drawer";
import { Field } from "../shared/Field";
import { inputCls } from "../shared/styles";
import { useLanguage } from "@/contexts/LanguageContext";

function BrandFormDrawer({
  editing,
  onClose,
  onDone,
}: {
  editing: Brand | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t, dir } = useLanguage();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir={dir}>
      <Field label={t("fieldName")} error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder={t("brandNamePlaceholder")} />
      </Field>
      <Field label={t("fieldSlug")} error={errors.slug?.message}>
        <input
          {...register("slug")}
          className={inputCls}
          placeholder="toyota"
          disabled={isEdit}
          dir="ltr"
        />
      </Field>
      <Field label={t("fieldLogoUrl")} error={errors.logoUrl?.message}>
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

export function BrandsPanel() {
  const { t, dir } = useLanguage();
  const { data, loading, error } = useQuery(GET_BRANDS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteBrand] = useMutation(DELETE_BRAND, { refetchQueries: [{ query: GET_BRANDS }] });

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

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirmBrand"))) return;
    await deleteBrand({ variables: { id } });
  };

  if (error)
    return (
      <p className="text-danger text-sm">{t("errorLoadBrands")}: {error.message}</p>
    );

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text">{t("brandsHeading")}</h2>
        <button
          onClick={openCreate}
          className="bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {t("addBrand")}
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
              <th className="pb-3 font-medium pe-4">{t("fieldName")}</th>
              <th className="pb-3 font-medium pe-4">Slug</th>
              <th className="pb-3 font-medium pe-4">{t("tableColStatus")}</th>
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
                    {b.isActive ? t("flagEnabled") : t("flagDisabled")}
                  </span>
                </td>
                <td className="py-3 text-end">
                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openEdit(b)}
                      className="text-xs text-text-muted hover:text-accent transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <Link
                      to="/catalog/brands/$brandId"
                      params={{ brandId: b.id }}
                      className="text-xs text-accent hover:underline"
                    >
                      {t("details")}
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id)}
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
        title={editing ? t("drawerEditBrand") : t("drawerNewBrand")}
        onClose={closeDrawer}
      >
        {drawerOpen && (
          <BrandFormDrawer
            editing={editing}
            onClose={closeDrawer}
            onDone={closeDrawer}
          />
        )}
      </Drawer>
    </div>
  );
}
