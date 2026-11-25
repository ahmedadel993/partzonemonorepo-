"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { logout } from "./actions/authActions";
import { useRouter } from "next/navigation";

interface Props {
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  locale: string;
}

export function DeleteAccountSection({ deleteAccount, locale }: Props) {
  const t = useTranslations("account");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      setError(null);
      const res = await deleteAccount();
      if (!res.ok) {
        setError(res.error ?? "فشل حذف الحساب");
        return;
      }
      await logout();
      router.push(`/${locale}`);
    });
  };

  return (
    <section className="border border-error/40 rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-error">{t("deleteAccountTitle")}</h3>
      <p className="text-xs text-text-muted">{t("deleteAccountWarning")}</p>

      {error && (
        <p className="text-xs text-error bg-error/10 rounded p-2">{error}</p>
      )}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="text-sm text-error border border-error/40 hover:bg-error/10 px-4 py-2 rounded-lg transition-colors"
        >
          {t("deleteAccountBtn")}
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm bg-error text-white hover:bg-error/80 px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {isPending ? t("deleting") : t("deleteAccountConfirm")}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="text-sm text-text-muted border border-border hover:text-text px-4 py-2 rounded-lg transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      )}
    </section>
  );
}
