import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/i18n/translations";

interface LanguageContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: TranslationKey) => string;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem("admin-lang");
    if (stored === "ar" || stored === "en") return stored;
  } catch {}
  return "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  function setLang(next: Lang) {
    setLangState(next);
    try { localStorage.setItem("admin-lang", next); } catch {}
  }

  function t(key: TranslationKey): string {
    return translations[lang][key];
  }

  return (
    <LanguageContext.Provider value={{ lang, dir, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
