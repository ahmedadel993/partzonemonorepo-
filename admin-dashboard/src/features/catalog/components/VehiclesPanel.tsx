import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GET_VEHICLE_MAKES,
  GET_VEHICLE_MODELS,
  CREATE_VEHICLE_MAKE,
  CREATE_VEHICLE_MODEL,
} from "../graphql/catalogApi";

interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface VehicleModel {
  id: string;
  name: string;
  slug: string;
  vehicleMakeId: string;
}

const makeSchema = z.object({
  name: z.string().min(1, "مطلوب").max(200),
  slug: z.string().min(1, "مطلوب").max(200).regex(/^[a-z0-9-]+$/, "lowercase, أرقام، شرطات فقط"),
});
type MakeForm = z.infer<typeof makeSchema>;

const modelSchema = z.object({
  name: z.string().min(1, "مطلوب").max(200),
  slug: z.string().min(1, "مطلوب").max(200).regex(/^[a-z0-9-]+$/, "lowercase, أرقام، شرطات فقط"),
});
type ModelForm = z.infer<typeof modelSchema>;

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

function MakeFormDrawer({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir="rtl">
      <Field label="الاسم" error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder="تويوتا" />
      </Field>
      <Field label="الـ Slug" error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="toyota" dir="ltr" />
      </Field>
      {serverError && <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60">
          {isSubmitting ? "جارٍ الحفظ…" : "إضافة"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
          إلغاء
        </button>
      </div>
    </form>
  );
}

function ModelFormDrawer({ makeId, onClose, onDone }: { makeId: string; onClose: () => void; onDone: () => void }) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" dir="rtl">
      <Field label="الاسم" error={errors.name?.message}>
        <input {...register("name")} className={inputCls} placeholder="كامري" />
      </Field>
      <Field label="الـ Slug" error={errors.slug?.message}>
        <input {...register("slug")} className={inputCls} placeholder="camry" dir="ltr" />
      </Field>
      {serverError && <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{serverError}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60">
          {isSubmitting ? "جارٍ الحفظ…" : "إضافة"}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
          إلغاء
        </button>
      </div>
    </form>
  );
}

export function VehiclesPanel() {
  const { data: makesData, loading: makesLoading, error: makesError } = useQuery(GET_VEHICLE_MAKES);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const [makeDrawerOpen, setMakeDrawerOpen] = useState(false);
  const [modelDrawerOpen, setModelDrawerOpen] = useState(false);

  const { data: modelsData, loading: modelsLoading } = useQuery(GET_VEHICLE_MODELS, {
    variables: { makeId: selectedMakeId },
    skip: !selectedMakeId,
  });

  const makes: VehicleMake[] = makesData?.vehicleMakes ?? [];
  const models: VehicleModel[] = modelsData?.vehicleModels ?? [];
  const selectedMake = makes.find((m) => m.id === selectedMakeId) ?? null;

  if (makesError)
    return <p className="text-danger text-sm">خطأ في تحميل المركبات: {makesError.message}</p>;

  return (
    <div dir="rtl" className="flex gap-6">
      {/* Makes panel */}
      <div className="w-72 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text">الماركات</h2>
          <button
            onClick={() => setMakeDrawerOpen(true)}
            className="text-sm bg-accent hover:bg-accent-hover text-accent-fg px-3 py-1.5 rounded transition-colors"
          >
            + إضافة
          </button>
        </div>
        {makesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-surface-alt rounded animate-pulse" />)}
          </div>
        ) : (
          <ul className="space-y-1">
            {makes.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setSelectedMakeId(m.id)}
                  className={[
                    "w-full text-start px-3 py-2 rounded text-sm transition-colors",
                    selectedMakeId === m.id
                      ? "bg-accent text-accent-fg"
                      : "text-text hover:bg-surface-alt",
                  ].join(" ")}
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Models panel */}
      <div className="flex-1 min-w-0">
        {selectedMake ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text">موديلات {selectedMake.name}</h2>
              <button
                onClick={() => setModelDrawerOpen(true)}
                className="text-sm bg-accent hover:bg-accent-hover text-accent-fg px-3 py-1.5 rounded transition-colors"
              >
                + إضافة موديل
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
                    <th className="pb-3 font-medium pe-4">الاسم</th>
                    <th className="pb-3 font-medium pe-4">Slug</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {models.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-alt transition-colors">
                      <td className="py-2.5 pe-4 text-text">{m.name}</td>
                      <td className="py-2.5 pe-4 text-text-muted font-mono" dir="ltr">{m.slug}</td>
                    </tr>
                  ))}
                  {models.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-text-muted text-xs">
                        لا توجد موديلات بعد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-text-muted text-sm rounded-lg border border-dashed border-border">
            اختر ماركة من اليمين لعرض الموديلات
          </div>
        )}
      </div>

      {/* Make drawer */}
      <Drawer open={makeDrawerOpen} title="إضافة ماركة جديدة" onClose={() => setMakeDrawerOpen(false)}>
        <MakeFormDrawer onClose={() => setMakeDrawerOpen(false)} onDone={() => setMakeDrawerOpen(false)} />
      </Drawer>

      {/* Model drawer */}
      {selectedMakeId && (
        <Drawer open={modelDrawerOpen} title={`إضافة موديل لـ ${selectedMake?.name}`} onClose={() => setModelDrawerOpen(false)}>
          <ModelFormDrawer
            makeId={selectedMakeId}
            onClose={() => setModelDrawerOpen(false)}
            onDone={() => setModelDrawerOpen(false)}
          />
        </Drawer>
      )}
    </div>
  );
}
