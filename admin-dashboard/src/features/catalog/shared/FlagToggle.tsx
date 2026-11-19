import { useLanguage } from "@/contexts/LanguageContext";

export function FlagToggle({
  label,
  checked,
  busy,
  onChange,
}: {
  label: string;
  checked: boolean;
  busy: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useLanguage();
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={busy}
        onClick={() => onChange(!checked)}
        className="flex items-center gap-2 text-xs disabled:opacity-50"
      >
        <span
          className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
            checked ? "bg-success" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
              checked ? "start-[1.125rem]" : "start-0.5"
            }`}
          />
        </span>
        <span className={checked ? "text-success font-medium" : "text-text-muted"}>
          {checked ? t("flagEnabled") : t("flagDisabled")}
        </span>
      </button>
    </label>
  );
}
