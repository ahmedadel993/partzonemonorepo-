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
  createUserSchema,
  updateUserSchema,
  type CreateUserForm,
  type UpdateUserForm,
} from "@/features/identity/users/validation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_COLOR: Record<string, string> = {
  Admin: "bg-danger/15 text-danger",
  Vendor: "bg-accent/15 text-accent",
  ContentManager: "bg-sky-500/15 text-sky-500",
  Customer: "bg-surface-alt text-text-muted",
};

const ROLES = ["Customer", "Admin", "Vendor", "ContentManager"];

const fieldCls =
  "block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent";

function UserFormDrawer({
  editing,
  onClose,
}: {
  editing: User | null;
  onClose: () => void;
}) {
  const { t, dir } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = editing !== null;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<
    CreateUserForm | UpdateUserForm
  >({
    resolver: zodResolver((isEdit ? updateUserSchema : createUserSchema) as any),
    defaultValues: isEdit
      ? {
          firstName: editing.firstName,
          lastName: editing.lastName,
          phoneNumber: editing.phoneNumber ?? "",
          role: editing.role,
        }
      : { email: "", password: "", firstName: "", lastName: "", role: "Customer" },
  });

  const [createUser] = useMutation(ADMIN_CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });
  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const onSubmit = async (vals: CreateUserForm | UpdateUserForm) => {
    setServerError(null);
    if (isEdit) {
      const v = vals as UpdateUserForm;
      const res = await updateUser({ variables: { input: { id: editing!.id, ...v } } });
      if (res.data?.updateUser?.errors?.length) {
        setServerError(res.data.updateUser.errors[0]);
        return;
      }
    } else {
      const v = vals as CreateUserForm;
      const res = await createUser({ variables: { input: v } });
      if (res.data?.adminCreateUser?.errors?.length) {
        setServerError(res.data.adminCreateUser.errors[0]);
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
        <>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              {t("fieldEmail")}
            </label>
            <input
              {...register("email" as keyof (CreateUserForm & UpdateUserForm))}
              type="email"
              placeholder="user@example.com"
              className={fieldCls}
              dir="ltr"
            />
            {e.email && <p className="text-xs text-danger mt-1">{e.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              {t("fieldPassword")}
            </label>
            <input
              {...register("password" as keyof (CreateUserForm & UpdateUserForm))}
              type="password"
              className={fieldCls}
            />
            {e.password && <p className="text-xs text-danger mt-1">{e.password.message}</p>}
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {t("fieldFirstName")}
          </label>
          <input {...register("firstName")} type="text" className={fieldCls} />
          {e.firstName && <p className="text-xs text-danger mt-1">{e.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {t("fieldLastName")}
          </label>
          <input {...register("lastName")} type="text" className={fieldCls} />
          {e.lastName && <p className="text-xs text-danger mt-1">{e.lastName.message}</p>}
        </div>
      </div>

      {isEdit && (
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {t("fieldPhone")}
          </label>
          <input
            {...register("phoneNumber" as keyof (CreateUserForm & UpdateUserForm))}
            className={fieldCls}
            dir="ltr"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          {t("fieldRole")}
        </label>
        <select {...register("role")} className={fieldCls}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {e.role && <p className="text-xs text-danger mt-1">{e.role.message}</p>}
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

export function UsersPanel() {
  const { t, dir } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const { data, loading, error } = useQuery<{ users: User[] }>(GET_USERS);
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
  });
  const [activateUser] = useMutation(ACTIVATE_USER, { refetchQueries: [{ query: GET_USERS }] });
  const [deactivateUser] = useMutation(DEACTIVATE_USER, { refetchQueries: [{ query: GET_USERS }] });

  const users = (data?.users ?? []).filter(
    (u) =>
      !search ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setDrawerOpen(true);
  };
  const handleDelete = async (u: User) => {
    await deleteUser({ variables: { id: u.id } });
    setConfirmDelete(null);
  };

  return (
    <div dir={dir} className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-text">{t("usersHeading")}</h2>
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
            + {t("addUser")}
          </button>
        </div>
      </div>

      {loading && <p className="text-text-muted text-sm">{t("loading")}</p>}
      {error && <p className="text-danger text-sm">{t("usersError").replace("{error}", error.message)}</p>}

      {!loading && !error && (
        <div dir={dir} className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableEmail")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableFullName")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("fieldRole")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableRegDate")}</th>
                <th className="px-4 py-3 text-start text-text-muted font-medium">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    {t("noUsers")}
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 text-text font-mono text-xs" dir="ltr">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ROLE_COLOR[u.role] ?? "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isActive ? "bg-success/15 text-success" : "bg-surface-alt text-text-muted"}`}>
                      {u.isActive ? t("userStatusActive") : t("userStatusInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs" dir="ltr">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs text-accent hover:underline"
                      >
                        {t("edit")}
                      </button>
                      {u.isActive ? (
                        <button
                          onClick={() => deactivateUser({ variables: { id: u.id } })}
                          className="text-xs text-text-muted hover:text-danger"
                        >
                          {t("actionDeactivate")}
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUser({ variables: { id: u.id } })}
                          className="text-xs text-text-muted hover:text-success"
                        >
                          {t("actionActivate")}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(u)}
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
        title={editing ? t("drawerEditUser") : t("drawerNewUser")}
      >
        {drawerOpen && (
          <UserFormDrawer editing={editing} onClose={() => setDrawerOpen(false)} />
        )}
      </Drawer>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            dir={dir}
            className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4"
          >
            <p className="text-sm text-text">{t("deleteConfirmUser")}</p>
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

export default UsersPanel;
