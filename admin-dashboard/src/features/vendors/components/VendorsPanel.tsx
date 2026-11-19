import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Drawer } from "@/features/catalog/shared/Drawer";
import {
  GET_VENDORS,
  ADMIN_CREATE_VENDOR,
  UPDATE_VENDOR,
  DELETE_VENDOR,
  APPROVE_VENDOR,
  SUSPEND_VENDOR,
} from "@/features/identity/graphql/identityApi";
import {
  createVendorSchema,
  updateVendorSchema,
  type CreateVendorForm,
  type UpdateVendorForm,
} from "@/features/identity/vendors/validation";

interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  taxId: string | null;
  phoneNumber: string | null;
  commissionRate: number;
  status: "Pending" | "Approved" | "Suspended";
  createdAt: string;
}

type TabFilter = "All" | "Pending" | "Approved" | "Suspended";

const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-warning/15 text-warning",
  Approved: "bg-success/15 text-success",
  Suspended: "bg-danger/15 text-danger",
};

const fieldCls =
  "block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent";

function VendorFormDrawer({
  editing,
  onClose,
}: {
  editing: Vendor | null;
  onClose: () => void;
}) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = editing !== null;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<
    CreateVendorForm | UpdateVendorForm
  >({
    resolver: zodResolver(isEdit ? updateVendorSchema : createVendorSchema) as never,
    defaultValues: isEdit
      ? {
          companyName: editing.companyName,
          taxId: editing.taxId ?? "",
          phoneNumber: editing.phoneNumber ?? "",
          commissionRate: editing.commissionRate,
        }
      : { userId: "", companyName: "", taxId: "", phoneNumber: "", commissionRate: 0.1 },
  });

  const [createVendor] = useMutation(ADMIN_CREATE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  });
  const [updateVendor] = useMutation(UPDATE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  });

  const onSubmit = async (vals: CreateVendorForm | UpdateVendorForm) => {
    setServerError(null);
    if (isEdit) {
      const v = vals as UpdateVendorForm;
      const res = await updateVendor({ variables: { input: { id: editing!.id, ...v } } });
      if (res.data?.updateVendor?.errors?.length) {
        setServerError(res.data.updateVendor.errors[0]);
        return;
      }
    } else {
      const v = vals as CreateVendorForm;
      const res = await createVendor({ variables: { input: v } });
      if (res.data?.adminCreateVendor?.errors?.length) {
        setServerError(res.data.adminCreateVendor.errors[0]);
        return;
      }
    }
    reset();
    onClose();
  };

  const e = errors as Record<string, { message?: string }>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir={dir} className="space-y-4 p-1">
      {!isEdit && (
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {t("fieldUserId")}
          </label>
          <input
            {...register("userId" as keyof (CreateVendorForm & UpdateVendorForm))}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className={fieldCls}
            dir="ltr"
          />
          {e.userId && <p className="text-xs text-danger mt-1">{e.userId.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          {t("fieldCompanyName")}
        </label>
        <input {...register("companyName")} className={fieldCls} />
        {e.companyName && <p className="text-xs text-danger mt-1">{e.companyName.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          {t("fieldTaxId")}
        </label>
        <input
          {...register("taxId" as keyof (CreateVendorForm & UpdateVendorForm))}
          className={fieldCls}
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          {t("fieldPhone")}
        </label>
        <input
          {...register("phoneNumber" as keyof (CreateVendorForm & UpdateVendorForm))}
          className={fieldCls}
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          {t("fieldCommission")}
        </label>
        <input
          {...register("commissionRate", { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          max="1"
          className={fieldCls}
          dir="ltr"
        />
        {e.commissionRate && (
          <p className="text-xs text-danger mt-1">{e.commissionRate.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{serverError}</p>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-border text-text-muted hover:border-accent hover:text-text transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? t("saving") : isEdit ? t("saveEdits") : t("add")}
        </button>
      </div>
    </form>
  );
}

export function VendorsPanel() {
  const { t, dir } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [confirmDelete, setConfirmDelete] = useState<Vendor | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, loading, error } = useQuery<{ gqlVendors: Vendor[] }>(GET_VENDORS);
  const [deleteVendor, { loading: deleting }] = useMutation(DELETE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  });
  const [approveVendor] = useMutation(APPROVE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  });
  const [suspendVendor] = useMutation(SUSPEND_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  });

  const TABS: { key: TabFilter; label: string }[] = [
    { key: "All", label: t("vendorFilterAll") },
    { key: "Pending", label: t("vendorStatusPending") },
    { key: "Approved", label: t("vendorStatusApproved") },
    { key: "Suspended", label: t("vendorStatusSuspended") },
  ];

  const STATUS_LABEL: Record<string, string> = {
    Pending: t("vendorStatusPending"),
    Approved: t("vendorStatusApproved"),
    Suspended: t("vendorStatusSuspended"),
  };

  const vendors = (data?.gqlVendors ?? []).filter(
    (v) => activeTab === "All" || v.status === activeTab
  );

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (v: Vendor) => {
    setEditing(v);
    setDrawerOpen(true);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id + "approve");
    await approveVendor({ variables: { id } });
    setActionLoading(null);
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id + "suspend");
    await suspendVendor({ variables: { id } });
    setActionLoading(null);
  };

  const handleDelete = async (v: Vendor) => {
    await deleteVendor({ variables: { id: v.id } });
    setConfirmDelete(null);
  };

  return (
    <div dir={dir} className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-text">{t("vendorsHeading")}</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          + {t("addVendor")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === key
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-muted text-sm">{t("loading")}</p>}
      {error && (
        <p className="text-danger text-sm">{t("vendorsError").replace("{error}", error.message)}</p>
      )}

      {!loading && !error && (
        <div dir={dir} className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-4 py-3 text-start text-text-muted font-medium">
                  {t("tableCompany")}
                </th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">
                  {t("tableTaxId")}
                </th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">
                  {t("tablePhone")}
                </th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">
                  {t("tableCommission")}
                </th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">
                  {t("tableVendorStatus")}
                </th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">
                  {t("tableActions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    {t("noVendors")}
                  </td>
                </tr>
              )}
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 text-text font-medium">{v.companyName}</td>
                  <td className="px-4 py-3 text-text-muted text-xs font-mono" dir="ltr">
                    {v.taxId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted" dir="ltr">
                    {v.phoneNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text" dir="ltr">
                    {(v.commissionRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLOR[v.status] ?? "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {STATUS_LABEL[v.status] ?? v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openEdit(v)}
                        className="text-xs text-accent hover:underline"
                      >
                        {t("edit")}
                      </button>
                      {(v.status === "Pending" || v.status === "Suspended") && (
                        <button
                          onClick={() => handleApprove(v.id)}
                          disabled={actionLoading === v.id + "approve"}
                          className="text-xs text-success hover:underline disabled:opacity-50"
                        >
                          {t("actionApprove")}
                        </button>
                      )}
                      {v.status === "Approved" && (
                        <button
                          onClick={() => handleSuspend(v.id)}
                          disabled={actionLoading === v.id + "suspend"}
                          className="text-xs text-warning hover:underline disabled:opacity-50"
                        >
                          {t("actionSuspend")}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(v)}
                        className="text-xs text-danger hover:underline"
                      >
                        {t("delete")}
                      </button>
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
        onClose={() => setDrawerOpen(false)}
        title={editing ? t("drawerEditVendor") : t("drawerNewVendor")}
      >
        {drawerOpen && (
          <VendorFormDrawer editing={editing} onClose={() => setDrawerOpen(false)} />
        )}
      </Drawer>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            dir={dir}
            className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4"
          >
            <p className="text-sm text-text">{t("deleteConfirmVendor")}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-muted"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="px-3 py-1.5 text-sm bg-danger text-white rounded-lg disabled:opacity-50"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorsPanel;
