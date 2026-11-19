import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL ?? "/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pz_access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const inputCls =
  "w-full bg-surface-alt border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export default function SettingsStub() {
  const { t } = useLanguage();
  const FIELDS: { key: string; label: string; type: string; maxLength?: number }[] = [
    { key: "store_name",          label: t("fieldStoreName"),          type: "text" },
    { key: "store_email",         label: t("fieldStoreEmail"),         type: "email" },
    { key: "store_phone",         label: t("fieldPhone"),              type: "tel" },
    { key: "shipping_threshold",  label: t("fieldShippingThreshold"),  type: "number" },
    { key: "currency",            label: t("fieldCurrencyCode"),       type: "text", maxLength: 3 },
  ];
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch(`${API}/admin/settings`, { headers: authHeaders() })
      .then((r) => r.json() as Promise<Record<string, string>>)
      .then(setValues)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const r = await fetch(`${API}/admin/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(values),
      });
      if (r.ok) {
        setFeedback({ ok: true, msg: t("saveFeedbackOk") });
      } else {
        setFeedback({ ok: false, msg: t("saveFeedbackError").replace("{status}", String(r.status)) });
      }
    } catch {
      setFeedback({ ok: false, msg: t("saveFeedbackNetwork") });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-4 max-w-lg">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-surface-alt rounded animate-pulse" />)}
      </div>
    );

  return (
    <form onSubmit={handleSave} className="max-w-lg">
      <h2 className="text-lg font-semibold text-text mb-6">{t("settingsHeading")}</h2>

      {FIELDS.map(({ key, label, type, maxLength }) => (
        <div key={key} className="mb-4">
          <label className="block text-sm text-text-muted mb-1">{label}</label>
          <input
            type={type}
            value={values[key] ?? ""}
            maxLength={maxLength}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            className={inputCls}
            dir={type === "email" || type === "tel" ? "ltr" : undefined}
          />
        </div>
      ))}

      {feedback && (
        <p className={[
          "text-xs px-3 py-2 rounded mb-4",
          feedback.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
        ].join(" ")}>
          {feedback.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-60"
      >
        {saving ? t("saveSettingsSubmitting") : t("saveSettings")}
      </button>
    </form>
  );
}
