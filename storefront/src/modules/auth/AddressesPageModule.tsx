import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Address } from "@/modules/auth/types";

interface AddressesPageModuleProps {
  addresses: Address[];
  locale: string;
  errorParam: string | undefined;
  handleDelete: (formData: FormData) => Promise<void>;
  handleAdd: (formData: FormData) => Promise<void>;
}

export async function AddressesPageModule({
  addresses,
  locale,
  errorParam,
  handleDelete,
  handleAdd,
}: AddressesPageModuleProps) {
  const t = await getTranslations({ locale, namespace: "address" });

  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/account`}
          className="text-text-muted hover:text-text transition-colors text-sm"
        >
          {t("back")}
        </Link>
        <h1 className="text-2xl font-bold text-text">{t("title")}</h1>
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
                <div className="flex items-center gap-2">
                  {addr.isDefault && (
                    <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
                      {t("default")}
                    </span>
                  )}
                  <form action={handleDelete}>
                    <input type="hidden" name="addressId" value={addr.id} />
                    <button
                      type="submit"
                      className="text-xs text-danger/70 hover:text-danger transition-colors"
                    >
                      {t("delete")}
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-sm text-text-muted">{addr.streetLine1}
                {addr.streetLine2 ? `، ${addr.streetLine2}` : ""}
              </p>
              <p className="text-sm text-text-muted">{addr.city}، {addr.governorate} {addr.postalCode}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-6">{t("empty")}</p>
      )}

      {/* Add new address form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold text-text mb-4">{t("addNew")}</h2>

        {errorParam === "add_failed" && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-4">
            {t("saveError")}
          </p>
        )}

        <form action={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">{t("descLabel")}</label>
            <input
              name="label"
              required
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder={t("descPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">{t("line1Label")}</label>
            <input
              name="streetLine1"
              required
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder={t("line1Placeholder")}
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">{t("line2Label")}</label>
            <input
              name="streetLine2"
              className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              placeholder={t("line2Placeholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">{t("cityLabel")}</label>
              <input
                name="city"
                required
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                placeholder={t("cityPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">{t("governorateLabel")}</label>
              <input
                name="governorate"
                required
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                placeholder={t("cityPlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">{t("postalCodeLabel")}</label>
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
            {t("setDefault")}
          </label>

          <button
            type="submit"
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-fg text-sm font-semibold rounded-lg transition-colors"
          >
            {t("saveButton")}
          </button>
        </form>
      </div>
    </main>
  );
}
