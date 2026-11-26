"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { register } from "@/modules/auth/actions/authActions";
import { registerSchema, type RegisterForm } from "@/modules/auth/schemas";

export function RegisterPageModule() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const requested = searchParams.get("redirect");
  const redirect =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : `/${locale}`;

  const [isPending, startTransition] = useTransition();

  const {
    register: reg,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (vals: RegisterForm) => {
    startTransition(async () => {
      const result = await register(vals.firstName, vals.lastName, vals.email, vals.password);
      if (result.error) {
        setError("root", { message: result.error });
      } else {
        window.location.replace(redirect);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-medium text-text">{t("firstNameLabel")}</label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder={t("firstNamePlaceholder")}
                {...reg("firstName")}
              />
              {errors.firstName && <p className="text-xs text-danger">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-medium text-text">{t("lastNameLabel")}</label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder={t("lastNamePlaceholder")}
                {...reg("lastName")}
              />
              {errors.lastName && <p className="text-xs text-danger">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-text">{t("emailLabel")}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="name@example.com"
              dir="ltr"
              {...reg("email")}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-text">{t("passwordLabel")}</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder={t("passwordPlaceholder")}
              dir="ltr"
              {...reg("password")}
            />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <p role="alert" className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {isPending ? t("registerSubmitting") : t("registerSubmit")}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted">
          {t("haveAccount")}{" "}
          <Link
            href={`/${locale}/auth/login${redirect !== `/${locale}` ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-accent hover:underline"
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
