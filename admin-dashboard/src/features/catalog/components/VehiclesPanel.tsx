import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GET_VEHICLE_MAKES,
  GET_VEHICLE_MODELS,
  CREATE_VEHICLE_MAKE,
  UPDATE_VEHICLE_MAKE,
  DELETE_VEHICLE_MAKE,
  CREATE_VEHICLE_MODEL,
  UPDATE_VEHICLE_MODEL,
  DELETE_VEHICLE_MODEL,
} from "../graphql/catalogApi";
import { VehicleMake, VehicleModel } from "../vehicles/types";
import {
  makeSchema, MakeForm,
  makeEditSchema, MakeEditForm,
  modelSchema, ModelForm,
  modelEditSchema, ModelEditForm,
} from "../vehicles/validation";
import { Drawer } from "../shared/Drawer";
import { Field } from "../shared/Field";
import { inputCls } from "../shared/styles";
import { useLanguage } from "@/contexts/LanguageContext";

function MakeFormDrawer({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MakeForm>({
    resolver: zodResolver(makeSchema),
    defaultValues: { name: "", slug: "" },
  });
  const [createMake] = useMutation(CREATE_VEHICLE_MAKE, { refetchQueries: [{ query: GET_VEHICLE_MAKES }] });

  const onSubmit = async (data: MakeForm) => {
    setServerError(null);
    try {
      const res = await createMake({ variables: { input: { name: data.name, slug: data.slug } } });
      if (res.data?.createVehicleMake.errors?.length)
        return setServerError(res.data.createVehicleMake.errors[0]);
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
        <input {...register("slug")} className={inputCls} placeholder="toyota" dir="ltr" />
      </Field>
      {serverError && <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60">
          {isSubmitting ? t("saving") : t("add")}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

function MakeEditDrawer({ make, onClose, onDone }: { make: VehicleMake; onClose: () => void; onDone: () => void }) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MakeEditForm>({
    resolver: zodResolver(makeEditSchema),
    defaultValues: { name: make.name },
  });
  const [updateMake] = useMutation(UPDATE_VEHICLE_MAKE, { refetchQueries: [{ query: GET_VEHICLE_MAKES }] });

  const onSubmit = async (data: MakeEditForm) => {
    setServerError(null);
    try {
      const res = await updateMake({ variables: { input: { id: make.id, name: data.name } } });
      if (res.data?.updateVehicleMake.errors?.length)
        return setServerError(res.data.updateVehicleMake.errors[0]);
      onDone();
    } catch (e: unknown) {
      setServerError((e as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir={dir}>
      <Field label={t("fieldName")} error={errors.name?.message}>
        <input {...register("name")} className={inputCls} />
      </Field>
      {serverError && <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60">
          {isSubmitting ? t("saving") : t("save")}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

function ModelFormDrawer({ makeId, onClose, onDone }: { makeId: string; onClose: () => void; onDone: () => void }) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
    defaultValues: { name: "", slug: "" },
  });
  const [createModel] = useMutation(CREATE_VEHICLE_MODEL, {
    refetchQueries: [{ query: GET_VEHICLE_MODELS, variables: { makeId } }],
  });

  const onSubmit = async (data: ModelForm) => {
    setServerError(null);
    try {
      const res = await createModel({ variables: { input: { name: data.name, slug: data.slug, vehicleMakeId: makeId } } });
      if (res.data?.createVehicleModel.errors?.length)
        return setServerError(res.data.createVehicleModel.errors[0]);
      onDone();
    } catch (e: unknown) {
      setServerError((e as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir={dir}>
      <Field label={t("fieldName")} error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder={t("modelNamePlaceholder")} />
      </Field>
      <Field label={t("fieldSlug")} error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="camry" dir="ltr" />
      </Field>
      {serverError && <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60">
          {isSubmitting ? t("saving") : t("add")}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

function ModelEditDrawer({ model, makeId, onClose, onDone }: { model: VehicleModel; makeId: string; onClose: () => void; onDone: () => void }) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ModelEditForm>({
    resolver: zodResolver(modelEditSchema),
    defaultValues: { name: model.name },
  });
  const [updateModel] = useMutation(UPDATE_VEHICLE_MODEL, {
    refetchQueries: [{ query: GET_VEHICLE_MODELS, variables: { makeId } }],
  });

  const onSubmit = async (data: ModelEditForm) => {
    setServerError(null);
    try {
      const res = await updateModel({ variables: { input: { id: model.id, name: data.name } } });
      if (res.data?.updateVehicleModel.errors?.length)
        return setServerError(res.data.updateVehicleModel.errors[0]);
      onDone();
    } catch (e: unknown) {
      setServerError((e as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir={dir}>
      <Field label={t("fieldName")} error={errors.name?.message}>
        <input {...register("name")} className={inputCls} />
      </Field>
      {serverError && <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60">
          {isSubmitting ? t("saving") : t("save")}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

export function VehiclesPanel() {
  const { t, dir } = useLanguage();
  const { data: makesData, loading: makesLoading, error: makesError } = useQuery(GET_VEHICLE_MAKES);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const [makeDrawerOpen, setMakeDrawerOpen] = useState(false);
  const [editMake, setEditMake] = useState<VehicleMake | null>(null);
  const [modelDrawerOpen, setModelDrawerOpen] = useState(false);
  const [editModel, setEditModel] = useState<VehicleModel | null>(null);

  const { data: modelsData, loading: modelsLoading } = useQuery(GET_VEHICLE_MODELS, {
    variables: { makeId: selectedMakeId },
    skip: !selectedMakeId,
  });

  const [deleteMake] = useMutation(DELETE_VEHICLE_MAKE, { refetchQueries: [{ query: GET_VEHICLE_MAKES }] });
  const [deleteModel] = useMutation(DELETE_VEHICLE_MODEL);

  const makes: VehicleMake[] = makesData?.vehicleMakes ?? [];
  const models: VehicleModel[] = modelsData?.vehicleModels ?? [];
  const selectedMake = makes.find((m) => m.id === selectedMakeId) ?? null;

  const handleDeleteMake = async (id: string) => {
    if (!confirm(t("deleteConfirmMake"))) return;
    if (selectedMakeId === id) setSelectedMakeId(null);
    await deleteMake({ variables: { id } });
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm(t("deleteConfirmModel"))) return;
    await deleteModel({
      variables: { id },
      refetchQueries: [{ query: GET_VEHICLE_MODELS, variables: { makeId: selectedMakeId } }],
    });
  };

  if (makesError)
    return <p className="text-danger text-sm">{t("errorLoadVehicles")}: {makesError.message}</p>;

  return (
    <div dir={dir} className="flex gap-6">
      <div className="w-72 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text">{t("makesHeading")}</h2>
          <button
            onClick={() => setMakeDrawerOpen(true)}
            className="text-sm bg-accent hover:bg-accent-hover text-accent-fg px-3 py-1.5 rounded transition-colors"
          >
            {t("addMake")}
          </button>
        </div>
        {makesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-surface-alt rounded animate-pulse" />)}
          </div>
        ) : (
          <ul className="space-y-1">
            {makes.map((m) => (
              <li key={m.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => setSelectedMakeId(m.id)}
                  className={[
                    "flex-1 text-start px-3 py-2 rounded text-sm transition-colors",
                    selectedMakeId === m.id
                      ? "bg-accent text-accent-fg"
                      : "text-text hover:bg-surface-alt",
                  ].join(" ")}
                >
                  {m.name}
                </button>
                <Link
                  to="/catalog/makes/$makeId"
                  params={{ makeId: m.id }}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-text-muted hover:text-accent transition-colors rounded"
                  title={t("view")}
                >
                  ↗
                </Link>
                <button
                  onClick={() => setEditMake(m)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-text-muted hover:text-text transition-colors rounded"
                  title={t("edit")}
                >
                  ✏
                </button>
                <button
                  onClick={() => handleDeleteMake(m.id)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-danger hover:text-danger/70 transition-colors rounded"
                  title={t("delete")}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {selectedMake ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text">{t("modelsOf").replace("{make}", selectedMake.name)}</h2>
              <button
                onClick={() => setModelDrawerOpen(true)}
                className="text-sm bg-accent hover:bg-accent-hover text-accent-fg px-3 py-1.5 rounded transition-colors"
              >
                {t("addModel")}
              </button>
            </div>
            {modelsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-surface-alt rounded animate-pulse" />)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-right">
                    <th className="pb-3 font-medium pe-4">{t("fieldName")}</th>
                    <th className="pb-3 font-medium pe-4">Slug</th>
                    <th className="pb-3 font-medium w-20">{t("tableColActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {models.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-alt transition-colors group">
                      <td className="py-2.5 pe-4 text-text">
                        <Link
                          to="/catalog/models/$modelId"
                          params={{ modelId: m.id }}
                          className="hover:text-accent hover:underline transition-colors"
                        >
                          {m.name}
                        </Link>
                      </td>
                      <td className="py-2.5 pe-4 text-text-muted font-mono" dir="ltr">{m.slug}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditModel(m)}
                            className="px-2 py-1 text-xs text-text-muted hover:text-text transition-colors rounded"
                            title={t("edit")}
                          >
                            ✏
                          </button>
                          <button
                            onClick={() => handleDeleteModel(m.id)}
                            className="px-2 py-1 text-xs text-danger hover:text-danger/70 transition-colors rounded"
                            title={t("delete")}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {models.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-text-muted text-xs">
                        {t("noModels")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-text-muted text-sm rounded-lg border border-dashed border-border">
            {t("selectMakeHint")}
          </div>
        )}
      </div>

      <Drawer open={makeDrawerOpen} title={t("drawerNewMake")} onClose={() => setMakeDrawerOpen(false)}>
        <MakeFormDrawer onClose={() => setMakeDrawerOpen(false)} onDone={() => setMakeDrawerOpen(false)} />
      </Drawer>

      <Drawer open={editMake !== null} title={t("drawerEditMake")} onClose={() => setEditMake(null)}>
        {editMake && (
          <MakeEditDrawer make={editMake} onClose={() => setEditMake(null)} onDone={() => setEditMake(null)} />
        )}
      </Drawer>

      {selectedMakeId && (
        <Drawer open={modelDrawerOpen} title={t("drawerNewModel").replace("{make}", selectedMake?.name ?? "")} onClose={() => setModelDrawerOpen(false)}>
          <ModelFormDrawer
            makeId={selectedMakeId}
            onClose={() => setModelDrawerOpen(false)}
            onDone={() => setModelDrawerOpen(false)}
          />
        </Drawer>
      )}

      {selectedMakeId && (
        <Drawer open={editModel !== null} title={t("drawerEditModel")} onClose={() => setEditModel(null)}>
          {editModel && (
            <ModelEditDrawer
              model={editModel}
              makeId={selectedMakeId}
              onClose={() => setEditModel(null)}
              onDone={() => setEditModel(null)}
            />
          )}
        </Drawer>
      )}
    </div>
  );
}
