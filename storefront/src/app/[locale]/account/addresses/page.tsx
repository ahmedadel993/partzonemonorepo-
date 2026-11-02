import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getMyAddresses, addAddress } from "@/modules/auth/actions/authActions";
import type { Address } from "@/modules/auth/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AddressesPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/account/addresses`);

  const addresses = await getMyAddresses();

  async function handleAdd(formData: FormData) {
    "use server";
    const input: Omit<Address, "id" | "userId"> = {
      label:       (formData.get("label")       as string).trim(),
      streetLine1: (formData.get("streetLine1") as string).trim(),
      streetLine2: (formData.get("streetLine2") as string | null)?.trim() || null,
      city:        (formData.get("city")        as string).trim(),
      governorate: (formData.get("governorate") as string).trim(),
      postalCode:  (formData.get("postalCode")  as string).trim(),
      isDefault:   formData.get("isDefault") === "on",
    };
    await addAddress(input);
    redirect(`/${locale}/account/addresses`);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/account`}
          className="text-text-muted hover:text-text transition-colors text-sm"
        >
          ← حسابي
        </Link>
        <h1 className="text-2xl font-bold text-text">عناويني</h1>
      </div>

      {/* Saved addresses */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-surface border border-border rounded-xl p-5 space-y-1"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-text">{addr.label}</p>
                {addr.isDefault && (
                  <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
                    افتراضي
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted">{addr.streetLine1}
                {addr.streetLine2 ? `، ${addr.streetLine2}` : ""}
              </p>
              <p className="text-sm text-text-muted">{addr.city}، {addr.governorate} {addr.postalCode}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-6">لا توجد عناوين محفوظة بعد</p>
      )}

      {/* Add new address form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold text-text mb-4">إضافة عنوان جديد</h2>
        <form action={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">الوصف (مثال: المنزل، العمل)</label>
            <input
              name="label"
              required
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder="المنزل"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">العنوان السطر الأول</label>
            <input
              name="streetLine1"
              required
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder="شارع التحرير، بجوار ..."
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">العنوان السطر الثاني (اختياري)</label>
            <input
              name="streetLine2"
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder="الدور الثالث، شقة 12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">المدينة</label>
              <input
                name="city"
                required
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                placeholder="القاهرة"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">المحافظة</label>
              <input
                name="governorate"
                required
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                placeholder="القاهرة"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">الرمز البريدي</label>
            <input
              name="postalCode"
              required
              dir="ltr"
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder="11511"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
            <input type="checkbox" name="isDefault" className="accent-accent w-4 h-4" />
            تعيين كعنوان افتراضي
          </label>

          <button
            type="submit"
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-fg text-sm font-semibold rounded-lg transition-colors"
          >
            حفظ العنوان
          </button>
        </form>
      </div>
    </main>
  );
}

export function generateMetadata() {
  return { title: "عناويني | PartZone" };
}
