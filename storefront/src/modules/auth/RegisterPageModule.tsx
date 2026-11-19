"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { register } from "@/modules/auth/actions/authActions";

export function RegisterPageModule() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only allow same-site paths ("/..." but not "//host") to avoid open redirects.
  const requested = searchParams.get("redirect");
  const redirect =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : `/${locale}`;

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await register(form.firstName, form.lastName, form.email, form.password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(redirect);
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-text">{t("registerTitle")}</h1>
          <p className="text-sm text-text-muted">{t("registerSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-medium text-text">{t("firstNameLabel")}</label>
              <input id="firstName" type="text" value={form.firstName} onChange={set("firstName")} required autoComplete="given-name"
                className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" placeholder={t("firstNamePlaceholder")} />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-medium text-text">{t("lastNameLabel")}</label>
              <input id="lastName" type="text" value={form.lastName} onChange={set("lastName")} required autoComplete="family-name"
                className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" placeholder={t("lastNamePlaceholder")} />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-text">{t("emailLabel")}</label>
            <input id="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email"
              className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="name@example.com" dir="ltr" />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-text">{t("passwordLabel")}</label>
            <input id="password" type="password" value={form.password} onChange={set("password")} required autoComplete="new-password" minLength={8}
              className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder={t("passwordPlaceholder")} dir="ltr" />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <button type="submit" disabled={isPending}
            className="w-full h-11 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors disabled:opacity-60">
            {isPending ? t("registerSubmitting") : t("registerSubmit")}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted">
          {t("haveAccount")}{" "}
          <Link href={`/${locale}/auth/login${redirect !== `/${locale}` ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-accent hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
