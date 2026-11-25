// Phase 6 – Payment methods CRUD panel
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GET_ALL_PAYMENT_METHODS,
  CREATE_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  ACTIVATE_PAYMENT_METHOD,
  DEACTIVATE_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  REORDER_PAYMENT_METHODS,
} from "../graphql/marketingApi";
import { getZodMessages } from "@/i18n/zodMessages";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentMethod {
  id: string;
  key: string;
  labelAr: string;
  labelEn: string;
  iconUrl: string | null;
  isActive: boolean;
  isComingSoon: boolean;
  sortOrder: number;
}

function Drawer({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  const { dir } = useLanguage();
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={[
        "fixed top-0 end-0 h-full w-full max-w-md bg-surface border-s border-border z-50",
        "transition-transform duration-300 overflow-y-auto",
        open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full invisible",
      ].join(" ")} dir={dir}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}

const zm = getZodMessages();
const pmSchema = z.object({
  key:         z.string().min(1, zm.required).regex(/^[a-z0-9_]+$/, zm.keyInvalid),
  labelAr:     z.string().min(1, zm.required),
  labelEn:     z.string().min(1, zm.required),
  iconUrl:     z.string().url(zm.urlInvalid).or(z.literal("")).optional(),
  isComingSoon: z.boolean().default(false),
  sortOrder:   z.coerce.number().int().min(0).default(0),
});
type PmForm = z.infer<typeof pmSchema>;

function PmFormDrawer({
  editing,
  onClose,
  onDone,
}: {
  editing: PaymentMethod | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [createPm] = useMutation(CREATE_PAYMENT_METHOD);
  const [updatePm] = useMutation(UPDATE_PAYMENT_METHOD);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PmForm>({
    resolver: zodResolver(pmSchema),
    defaultValues: editing
      ? {
          key: editing.key,
          labelAr: editing.labelAr,
          labelEn: editing.labelEn,
          iconUrl: editing.iconUrl ?? "",
          isComingSoon: editing.isComingSoon,
          sortOrder: editing.sortOrder,
        }
      : { key: "", labelAr: "", labelEn: "", iconUrl: "", isComingSoon: false, sortOrder: 0 },
  });

  const onSubmit = async (vals: PmForm) => {
    setServerError(null);
    try {
      if (editing) {
        const res = await updatePm({
          variables: {
            input: {
              id: editing.id,
              labelAr: vals.labelAr,
              labelEn: vals.labelEn,
              iconUrl: vals.iconUrl || null,
              isComingSoon: vals.isComingSoon,
              sortOrder: vals.sortOrder,
            },
          },
          refetchQueries: [{ query: GET_ALL_PAYMENT_METHODS }],
        });
        const errs = res.data?.updatePaymentMethod?.errors ?? [];
        if (errs.length) { setServerError(errs[0]); return; }
      } else {
        const res = await createPm({
          variables: {
            input: {
              key: vals.key,
              labelAr: vals.labelAr,
              labelEn: vals.labelEn,
              iconUrl: vals.iconUrl || null,
              isComingSoon: vals.isComingSoon,
              sortOrder: vals.sortOrder,
            },
          },
          refetchQueries: [{ query: GET_ALL_PAYMENT_METHODS }],
        });
        const errs = res.data?.createPaymentMethod?.errors ?? [];
        if (errs.length) { setServerError(errs[0]); return; }
      }
      onDone();
    } catch (e) {
      setServerError(String(e));
    }
  };

  const field = "block w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs text-text-muted mb-1">{t("fieldKey")}</label>
        <input {...register("key")} disabled={!!editing} placeholder="cash_on_delivery" className={field} dir="ltr" />
        {errors.key && <p className="text-xs text-error mt-1">{errors.key.message}</p>}
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{t("fieldNameArPay")}</label>
        <input {...register("labelAr")} placeholder={t("payMethodNamePlaceholder")} className={field} dir="rtl" />
        {errors.labelAr && <p className="text-xs text-error mt-1">{errors.labelAr.message}</p>}
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{t("fieldNameEnPay")}</label>
        <input {...register("labelEn")} placeholder="Cash on Delivery" className={field} dir="ltr" />
        {errors.labelEn && <p className="text-xs text-error mt-1">{errors.labelEn.message}</p>}
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{t("fieldIconUrl")}</label>
        <input {...register("iconUrl")} type="url" placeholder="https://…" className={field} dir="ltr" />
        {errors.iconUrl && <p className="text-xs text-error mt-1">{errors.iconUrl.message}</p>}
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">{t("fieldSortOrder")}</label>
        <input {...register("sortOrder")} type="number" min={0} className={field} dir="ltr" />
      </div>
      <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
        <input {...register("isComingSoon")} type="checkbox" className="rounded" />
        {t("fieldComingSoon")}
      </label>

      {serverError && (
        <p className="text-xs text-error bg-error/10 rounded p-2">{serverError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-60"
        >
          {isSubmitting ? t("payMethodSaving") : editing ? t("savePayMethod") : t("addPayMethodBtn")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors"
        >
          {t("payActionCancel")}
        </button>
      </div>
    </form>
  );
}

export function PaymentMethodsPanel() {
  const { t, dir } = useLanguage();
  const { data, loading } = useQuery<{ paymentMethods: PaymentMethod[] }>(
    GET_ALL_PAYMENT_METHODS
  );
  const [activatePm] = useMutation(ACTIVATE_PAYMENT_METHOD);
  const [deactivatePm] = useMutation(DEACTIVATE_PAYMENT_METHOD);
  const [deletePm] = useMutation(DELETE_PAYMENT_METHOD);
  const [reorderPm] = useMutation(REORDER_PAYMENT_METHODS, {
    refetchQueries: [{ query: GET_ALL_PAYMENT_METHODS }],
    awaitRefetchQueries: true,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const methods = data?.paymentMethods ?? [];
  const sorted = [...methods].sort((a, b) => a.sortOrder - b.sortOrder);

  const moveMethod = async (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    const input = reordered.map((m, i) => ({ id: m.id, sortOrder: i }));
    setBusyId(sorted[idx].id);
    try {
      await reorderPm({ variables: { input } });
    } finally {
      setBusyId(null);
    }
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const pmRefetch = { refetchQueries: [{ query: GET_ALL_PAYMENT_METHODS }] };

  const toggleActive = async (pm: PaymentMethod) => {
    setBusyId(pm.id);
    try {
      const mutation = pm.isActive ? deactivatePm : activatePm;
      await mutation({ variables: { id: pm.id }, ...pmRefetch });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deletePm({ variables: { id }, ...pmRefetch, awaitRefetchQueries: true });
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {t("payMethodCount").replace("{count}", String(methods.length))}
        </p>
        <button
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          className="bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {t("addPayMethod")}
        </button>
      </div>

      {loading && <p className="text-sm text-text-muted">{t("payMethodsLoading")}</p>}

      {!loading && methods.length === 0 && (
        <div className="text-center py-16 text-text-muted text-sm">
          {t("payMethodsEmpty")}
        </div>
      )}

      {methods.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm" dir={dir}>
            <thead className="bg-surface-alt text-text-muted text-xs">
              <tr>
                <th className="py-3 pe-4 text-start font-medium">{t("fieldName")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("tablePayKey")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("tablePayOrder")}</th>
                <th className="py-3 pe-4 text-start font-medium">{t("tablePayStatus")}</th>
                <th className="py-3 text-end font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((pm, idx) => (
                <tr key={pm.id} className="group hover:bg-surface-alt/40 transition-colors">
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-2">
                      {pm.iconUrl && (
                        <img src={pm.iconUrl} alt={pm.labelAr} className="w-6 h-6 object-contain" />
                      )}
                      <div>
                        <p className="font-medium text-text">{pm.labelAr}</p>
                        <p className="text-xs text-text-muted">{pm.labelEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pe-4 font-mono text-text-muted text-xs" dir="ltr">{pm.key}</td>
                  <td className="py-3 pe-4" dir="ltr">
                    <div className="flex items-center gap-1">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveMethod(idx, -1)}
                          disabled={idx === 0 || busyId !== null}
                          className="text-text-muted hover:text-text text-xs disabled:opacity-20 px-1 leading-none"
                          aria-label={t("ariaReorderUp")}
                        >▲</button>
                        <button
                          onClick={() => moveMethod(idx, 1)}
                          disabled={idx === sorted.length - 1 || busyId !== null}
                          className="text-text-muted hover:text-text text-xs disabled:opacity-20 px-1 leading-none"
                          aria-label={t("ariaReorderDown")}
                        >▼</button>
                      </div>
                      <span className="text-xs text-text-muted w-5 text-center">{pm.sortOrder}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={pm.isActive}
                      disabled={busyId === pm.id}
                      onClick={() => toggleActive(pm)}
                      className="flex items-center gap-2 text-xs disabled:opacity-50"
                    >
                      <span className={`relative inline-block w-9 h-5 rounded-full transition-colors ${pm.isActive ? "bg-success" : "bg-border"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${pm.isActive ? "start-[1.125rem]" : "start-0.5"}`} />
                      </span>
                      <span className={pm.isActive ? "text-success font-medium" : "text-text-muted"}>
                        {pm.isActive ? t("payActive") : t("payInactive")}
                      </span>
                    </button>
                    {pm.isComingSoon && (
                      <span className="text-[10px] text-warning bg-warning/10 rounded px-1 mt-0.5 block w-fit">{t("payComingSoon")}</span>
                    )}
                  </td>
                  <td className="py-3 text-end pe-2">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setEditing(pm); setDrawerOpen(true); }}
                        className="text-xs text-text-muted hover:text-accent"
                      >
                        {t("payActionEdit")}
                      </button>
                      {confirmDeleteId === pm.id ? (
                        <span className="flex gap-1">
                          <button
                            onClick={() => handleDelete(pm.id)}
                            className="text-xs text-error hover:underline"
                            disabled={busyId === pm.id}
                          >
                            {t("payActionConfirm")}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-text-muted hover:text-text">{t("payActionCancel")}</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(pm.id)}
                          className="text-xs text-error/60 hover:text-error"
                        >
                          {t("payActionDelete")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        title={editing ? t("drawerEditPay") : t("drawerNewPay")}
        onClose={closeDrawer}
      >
        {drawerOpen && (
          <PmFormDrawer
            editing={editing}
            onClose={closeDrawer}
            onDone={closeDrawer}
          />
        )}
      </Drawer>
    </div>
  );
}
