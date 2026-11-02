import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/useAuthStore";

const API = import.meta.env.VITE_API_URL ?? "/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/identity/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }
      const data = await res.json();
      setAuth(data.accessToken, data.userId, data.role);
      router.navigate({ to: "/" });
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-bg flex items-center justify-center font-sans p-4" dir="rtl">
      <div className="bg-surface border border-border rounded-xl w-full max-w-sm shadow-xl">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-text">PartZone</h1>
            <p className="text-sm text-text-muted">لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-text">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-text">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
