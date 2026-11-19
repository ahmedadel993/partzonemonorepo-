import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { AuthUser } from "@/modules/auth/types";

interface AccountPageModuleProps {
  user: AuthUser;
  locale: string;
  handleLogout: () => Promise<void>;
}

export async function AccountPageModule({ user, locale, handleLogout }: AccountPageModuleProps) {
  const t = await getTranslations({ locale, namespace: "account" });
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-text">{t("title")}</h1>

      {/* Profile card */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-fg font-bold text-xl shrink-0">
          {initials}
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-text">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-text-muted">{user.email}</p>
          {user.role && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
              {user.role}
            </span>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <Link
          href={`/${locale}/account/profile`}
          className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:bg-surface-alt transition-colors group"
        >
          <span className="font-medium text-text">{t("editProfile")}</span>
          <span className="text-text-muted group-hover:text-text transition-colors">→</span>
        </Link>
        <Link
          href={`/${locale}/orders`}
          className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:bg-surface-alt transition-colors group"
        >
          <span className="font-medium text-text">{t("orders")}</span>
          <span className="text-text-muted group-hover:text-text transition-colors">→</span>
        </Link>
        <Link
          href={`/${locale}/account/addresses`}
          className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:bg-surface-alt transition-colors group"
        >
          <span className="font-medium text-text">{t("addresses")}</span>
          <span className="text-text-muted group-hover:text-text transition-colors">→</span>
        </Link>
      </div>

      {/* Logout */}
      <form action={handleLogout}>
        <button
          type="submit"
          className="w-full h-11 rounded-xl border border-border text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
        >
          {t("logout")}
        </button>
      </form>
    </main>
  );
}
