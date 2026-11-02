import { useState, useEffect } from "react";

interface UserAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

const API = import.meta.env.VITE_API_URL ?? "/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pz_access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const ROLE_COLORS: Record<string, string> = {
  Admin:          "bg-danger/15 text-danger",
  Vendor:         "bg-accent/15 text-accent",
  ContentManager: "bg-sky-500/15 text-sky-500",
  Customer:       "bg-surface-alt text-text-muted",
};

const ROLES = ["Customer", "Vendor", "ContentManager", "Admin"];

export default function UsersStub() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API}/admin/users`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<UserAdmin[]>;
      })
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)
    );
  });

  const changeRole = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      const r = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text">المستخدمون</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد…"
          className="bg-surface-alt border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors w-64"
        />
      </div>

      {error && (
        <p className="text-danger text-sm mb-4">خطأ: {error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-surface-alt rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-right">
              <th className="pb-3 font-medium pe-4">البريد الإلكتروني</th>
              <th className="pb-3 font-medium pe-4">الاسم</th>
              <th className="pb-3 font-medium pe-4">الدور</th>
              <th className="pb-3 font-medium pe-4">تغيير الدور</th>
              <th className="pb-3 font-medium">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-surface-alt transition-colors">
                <td className="py-3 pe-4 text-text font-mono text-xs" dir="ltr">
                  {u.email}
                </td>
                <td className="py-3 pe-4 text-text">
                  {u.firstName} {u.lastName}
                </td>
                <td className="py-3 pe-4">
                  <span className={[
                    "px-2 py-0.5 rounded text-xs font-medium",
                    ROLE_COLORS[u.role] ?? "bg-surface-alt text-text-muted",
                  ].join(" ")}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 pe-4">
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={u.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        if (newRole !== u.role) changeRole(u.id, newRole);
                      }}
                      disabled={changingRole === u.id}
                      className="bg-surface-alt border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {changingRole === u.id && (
                      <span className="text-xs text-text-muted">جارٍ…</span>
                    )}
                  </div>
                </td>
                <td className="py-3 text-text-muted text-xs">
                  {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted text-sm">
                  لا توجد نتائج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
