import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { LangToggle } from "@/components/ui/LangToggle";

export function AppLayout({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { dir, t } = useLanguage();

  const NAV_ITEMS = [
    { to: "/",          label: t("dashboard") },
    { to: "/catalog",   label: t("catalog") },
    { to: "/marketing", label: t("marketing") },
    { to: "/orders",    label: t("orders") },
    { to: "/users",     label: t("users") },
    { to: "/customers", label: t("customersHeading") },
    { to: "/vendors",   label: t("vendors") },
    { to: "/erp",       label: t("erpSync") },
    { to: "/settings",  label: t("settings") },
  ];

  const handleLogout = () => {
    clearAuth();
    router.navigate({ to: "/login" });
  };

  return (
    <div dir={dir} className="dark flex h-screen bg-bg text-text font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-surface border-e border-border">
        <div className="h-16 flex items-center px-6 border-b border-border">
          {/* [LOGO PLACEHOLDER — awaiting partzone-logo.png] */}
          <span className="text-accent font-bold text-lg tracking-tight">PartZone</span>
          <span className="ms-1 text-text-muted text-xs font-medium">Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={[
                      "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-fg font-medium"
                        : "text-text-muted hover:bg-surface-alt hover:text-text",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-text-muted hover:bg-surface-alt hover:text-danger transition-colors"
          >
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface">
          <h1 className="text-sm font-medium text-text-muted capitalize">
            {location.pathname.replace("/", "") || t("dashboard")}
          </h1>
          <LangToggle />
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
