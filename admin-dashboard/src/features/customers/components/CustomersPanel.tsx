import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Drawer } from "@/features/catalog/shared/Drawer";
import {
  GET_USERS,
  ADMIN_CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  ACTIVATE_USER,
  DEACTIVATE_USER,
} from "@/features/identity/graphql/identityApi";
import {
  updateCustomerSchema,
  createUserSchema,
  type UpdateCustomerForm,
  type CreateUserForm,
} from "@/features/identity/users/validation";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const fieldCls =
  "block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent";

function CustomerFormDrawer({
  editing,
  onClose,
}: {
  editing: Customer;
  onClose: () => void;
}) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<UpdateCustomerForm>({
      resolver: zodResolver(updateCustomerSchema),
      defaultValues: {
        firstName: editing.firstName,
        lastName: editing.lastName,
        phoneNumber: editing.phoneNumber ?? "",
      },
    });

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { role: "Customer" } }],
  });

  const onSubmit = async (vals: UpdateCustomerForm) => {
    setServerError(null);
    const res = await updateUser({
      variables: { input: { id: editing.id, ...vals, role: "Customer" } },
    });
    if (res.data?.updateUser?.errors?.length) {
      setServerError(res.data.updateUser.errors[0]);
      return;
    }
    reset();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir={dir} className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {t("fieldFirstName")}
          </label>
          <input {...register("firstName")} className={fieldCls} />
          {errors.firstName && (
            <p className="text-xs text-danger mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {t("fieldLastName")}
          </label>
          <input {...register("lastName")} className={fieldCls} />
          {errors.lastName && (
            <p className="text-xs text-danger mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          {t("fieldPhone")}
        </label>
        <input {...register("phoneNumber")} className={fieldCls} dir="ltr" />
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
          {isSubmitting ? t("saving") : t("saveEdits")}
        </button>
      </div>
    </form>
  );
}

function CreateCustomerDrawer({ onClose }: { onClose: () => void }) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CreateUserForm>({
      resolver: zodResolver(createUserSchema),
      defaultValues: { email: "", password: "", firstName: "", lastName: "", role: "Customer" },
    });

  const [createUser] = useMutation(ADMIN_CREATE_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { role: "Customer" } }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (vals: CreateUserForm) => {
    setServerError(null);
    const res = await createUser({ variables: { input: { ...vals, role: "Customer" } } });
    if (res.data?.adminCreateUser?.errors?.length) {
      setServerError(res.data.adminCreateUser.errors[0]);
      return;
    }
    reset();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir={dir} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">{t("fieldEmail")}</label>
        <input {...register("email")} placeholder="customer@example.com" className={fieldCls} dir="ltr" />
        {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">{t("fieldPassword")}</label>
        <input {...register("password")} type="password" className={fieldCls} />
        {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">{t("fieldFirstName")}</label>
          <input {...register("firstName")} className={fieldCls} />
          {errors.firstName && <p className="text-xs text-danger mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">{t("fieldLastName")}</label>
          <input {...register("lastName")} className={fieldCls} />
          {errors.lastName && <p className="text-xs text-danger mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      {serverError && (
        <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{serverError}</p>
      )}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border text-text-muted hover:border-accent hover:text-text transition-colors">
          {t("cancel")}
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors">
          {isSubmitting ? t("saving") : t("add")}
        </button>
      </div>
    </form>
  );
}

export function CustomersPanel() {
  const { t, dir } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);

  const { data, loading, error } = useQuery<{ users: Customer[] }>(GET_USERS, {
    variables: { role: "Customer" },
  });

  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { role: "Customer" } }],
    awaitRefetchQueries: true,
  });
  const [activateUser] = useMutation(ACTIVATE_USER, { refetchQueries: [{ query: GET_USERS, variables: { role: "Customer" } }] });
  const [deactivateUser] = useMutation(DEACTIVATE_USER, { refetchQueries: [{ query: GET_USERS, variables: { role: "Customer" } }] });

  const customers = (data?.users ?? []).filter(
    (c) =>
      !search ||
      `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setCreating(true); };
  const openEdit = (c: Customer) => { setEditing(c); setDrawerOpen(true); };

  const handleDelete = async (c: Customer) => {
    await deleteUser({ variables: { id: c.id } });
    setConfirmDelete(null);
  };

  return (
    <div dir={dir} className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-text">{t("customersHeading")}</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("usersSearchPlaceholder")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            + {t("addCustomer")}
          </button>
        </div>
      </div>

      {loading && <p className="text-text-muted text-sm">{t("loading")}</p>}
      {error && <p className="text-danger text-sm">{t("customersError")}</p>}

      {!loading && !error && (
        <div dir={dir} className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableEmail")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableFullName")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("fieldPhone")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableRegDate")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    {t("noCustomers")}
                  </td>
                </tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 text-text font-mono text-xs" dir="ltr">{c.email}</td>
                  <td className="px-4 py-3 text-text">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-text-muted" dir="ltr">{c.phoneNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.isActive ? "bg-success/15 text-success" : "bg-surface-alt text-text-muted"}`}>
                      {c.isActive ? t("userStatusActive") : t("userStatusInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs" dir="ltr">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline">
                        {t("edit")}
                      </button>
                      {c.isActive ? (
                        <button onClick={() => deactivateUser({ variables: { id: c.id } })} className="text-xs text-text-muted hover:text-danger">
                          {t("actionDeactivate")}
                        </button>
                      ) : (
                        <button onClick={() => activateUser({ variables: { id: c.id } })} className="text-xs text-text-muted hover:text-success">
                          {t("actionActivate")}
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(c)} className="text-xs text-danger hover:underline">
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
        open={creating}
        onClose={() => setCreating(false)}
        title={t("drawerNewCustomer")}
      >
        {creating && (
          <CreateCustomerDrawer onClose={() => setCreating(false)} />
        )}
      </Drawer>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("drawerEditCustomer")}
      >
        {drawerOpen && editing && (
          <CustomerFormDrawer editing={editing} onClose={() => setDrawerOpen(false)} />
        )}
      </Drawer>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            dir={dir}
            className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4"
          >
            <p className="text-sm text-text">{t("deleteConfirmCustomer")}</p>
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

export default CustomersPanel;
