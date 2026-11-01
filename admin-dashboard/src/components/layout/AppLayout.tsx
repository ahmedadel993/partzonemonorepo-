import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard" },
  { to: "/catalog",   label: "Catalog" },
  { to: "/marketing", label: "Marketing" },
  { to: "/orders",    label: "Orders" },
  { to: "/users",     label: "Users" },
  { to: "/vendors",   label: "Vendors" },
  { to: "/erp",       label: "ERP Sync" },
  { to: "/settings",  label: "Settings" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { location } = useRouterState();

  return (
    <div className="dark flex h-screen bg-bg text-text font-sans overflow-hidden">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center px-6 border-b border-border bg-surface">
          <h1 className="text-sm font-medium text-text-muted capitalize">
            {location.pathname.replace("/", "") || "Dashboard"}
          </h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
