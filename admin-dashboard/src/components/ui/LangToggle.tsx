import { useLanguage } from "@/contexts/LanguageContext";

export function LangToggle() {
  const { lang, t, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="border border-border rounded px-3 py-1.5 text-sm text-text-muted hover:border-accent hover:text-text transition-colors"
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {t("switchLang")}
    </button>
  );
}
