import { useState, useEffect } from "react";

interface VendorDto {
  id: string;
  userId: string;
  companyName: string;
  taxId: string | null;
  phoneNumber: string | null;
  commissionRate: number;
  status: "Pending" | "Approved" | "Suspended";
  createdAt: string;
}

const API = import.meta.env.VITE_API_URL ?? "/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pz_access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-warning/15 text-warning",
  Approved:  "bg-success/15 text-success",
  Suspended: "bg-danger/15 text-danger",
};

const STATUS_LABELS: Record<string, string> = {
  Pending:   "معلّق الموافقة",
  Approved:  "موافق عليه",
  Suspended: "موقوف",
};

const TABS = ["الكل", "معلّق الموافقة", "موافق عليه", "موقوف"] as const;

export default function VendorsStub() {
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("الكل");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API}/admin/vendors`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<VendorDto[]>;
      })
      .then(setVendors)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = vendors.filter((v) => {
    if (activeTab === "الكل") return true;
    return STATUS_LABELS[v.status] === activeTab;
  });

  const doAction = async (id: string, action: "approve" | "suspend") => {
    setActionLoading(id + action);
    try {
      const r = await fetch(`${API}/admin/vendors/${id}/${action}`, {
        method: "PUT",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">الموردون</h2>
        <span className="text-sm text-text-muted">{vendors.length} مورّد</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-danger text-sm mb-4">خطأ: {error}</p>
      )}

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
              <th className="pb-3 font-medium pe-4">الشركة</th>
              <th className="pb-3 font-medium pe-4">الرقم الضريبي</th>
              <th className="pb-3 font-medium pe-4">الهاتف</th>
              <th className="pb-3 font-medium pe-4">العمولة</th>
              <th className="pb-3 font-medium pe-4">الحالة</th>
              <th className="pb-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-surface-alt transition-colors">
                <td className="py-3 pe-4 text-text font-medium">{v.companyName}</td>
                <td className="py-3 pe-4 text-text-muted text-xs font-mono">{v.taxId ?? "—"}</td>
                <td className="py-3 pe-4 text-text-muted" dir="ltr">{v.phoneNumber ?? "—"}</td>
                <td className="py-3 pe-4 text-text">{(v.commissionRate * 100).toFixed(0)}%</td>
                <td className="py-3 pe-4">
                  <span className={[
                    "px-2 py-0.5 rounded text-xs font-medium",
                    STATUS_COLORS[v.status] ?? "bg-surface-alt text-text-muted",
                  ].join(" ")}>
                    {STATUS_LABELS[v.status] ?? v.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    {v.status === "Pending" && (
                      <button
                        onClick={() => doAction(v.id, "approve")}
                        disabled={actionLoading === v.id + "approve"}
                        className="px-3 py-1 text-xs rounded bg-success/15 text-success hover:bg-success/25 transition-colors disabled:opacity-50"
                      >
                        موافقة
                      </button>
                    )}
                    {v.status === "Approved" && (
                      <button
                        onClick={() => doAction(v.id, "suspend")}
                        disabled={actionLoading === v.id + "suspend"}
                        className="px-3 py-1 text-xs rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors disabled:opacity-50"
                      >
                        تعليق
                      </button>
                    )}
                    {v.status === "Suspended" && (
                      <button
                        onClick={() => doAction(v.id, "approve")}
                        disabled={actionLoading === v.id + "approve"}
                        className="px-3 py-1 text-xs rounded bg-success/15 text-success hover:bg-success/25 transition-colors disabled:opacity-50"
                      >
                        إعادة تفعيل
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted text-sm">
                  لا يوجد موردون في هذه الفئة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
