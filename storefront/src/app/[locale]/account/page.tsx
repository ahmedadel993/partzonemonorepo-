import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout } from "@/modules/auth/actions/authActions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/account`);

  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  async function handleLogout() {
    "use server";
    await logout();
    redirect(`/${locale}`);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-text">حسابي</h1>

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
          href={`/${locale}/orders`}
          className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:bg-surface-alt transition-colors group"
        >
          <span className="font-medium text-text">طلباتي</span>
          <span className="text-text-muted group-hover:text-text transition-colors">←</span>
        </Link>
        <Link
          href={`/${locale}/account/addresses`}
          className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:bg-surface-alt transition-colors group"
        >
          <span className="font-medium text-text">عناويني</span>
          <span className="text-text-muted group-hover:text-text transition-colors">←</span>
        </Link>
      </div>

      {/* Logout */}
      <form action={handleLogout}>
        <button
          type="submit"
          className="w-full h-11 rounded-xl border border-border text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
        >
          تسجيل الخروج
        </button>
      </form>
    </main>
  );
}
