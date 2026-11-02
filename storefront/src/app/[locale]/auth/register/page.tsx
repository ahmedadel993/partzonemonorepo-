"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { register } from "@/modules/auth/actions/authActions";

export default function RegisterPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? `/${locale}`;

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
          <h1 className="text-2xl font-bold text-text">إنشاء حساب جديد</h1>
          <p className="text-sm text-text-muted">انضم إلى PartZone اليوم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-medium text-text">الاسم الأول</label>
              <input id="firstName" type="text" value={form.firstName} onChange={set("firstName")} required autoComplete="given-name"
                className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" placeholder="محمد" />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-medium text-text">الاسم الأخير</label>
              <input id="lastName" type="text" value={form.lastName} onChange={set("lastName")} required autoComplete="family-name"
                className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" placeholder="أحمد" />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-text">البريد الإلكتروني</label>
            <input id="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email"
              className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="name@example.com" dir="ltr" />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-text">كلمة المرور</label>
            <input id="password" type="password" value={form.password} onChange={set("password")} required autoComplete="new-password" minLength={8}
              className="w-full h-11 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="8 أحرف على الأقل" dir="ltr" />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <button type="submit" disabled={isPending}
            className="w-full h-11 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors disabled:opacity-60">
            {isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted">
          لديك حساب بالفعل؟{" "}
          <Link href={`/${locale}/auth/login${redirect !== `/${locale}` ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-accent hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}
