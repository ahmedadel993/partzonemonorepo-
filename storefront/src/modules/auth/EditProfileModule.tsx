"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface Props {
  user: { firstName: string; lastName: string; phoneNumber?: string };
  updateProfile: (
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (
    current: string,
    newPass: string
  ) => Promise<{ ok: boolean; error?: string }>;
}

const field =
  "block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent";

export function EditProfileModule({ user, updateProfile, changePassword }: Props) {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phoneNumber ?? "");
  const [profileStatus, setProfileStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);
    const res = await updateProfile(firstName, lastName, phone || undefined);
    setProfileStatus({
      ok: res.ok,
      msg: res.ok ? t("profileSaved") : (res.error ?? "Error"),
    });
    if (res.ok) router.refresh();
    setSavingProfile(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwStatus({ ok: false, msg: t("passwordMismatch") });
      return;
    }
    setSavingPw(true);
    setPwStatus(null);
    const res = await changePassword(currentPw, newPw);
    setPwStatus({
      ok: res.ok,
      msg: res.ok ? t("passwordChanged") : (res.error ?? "Error"),
    });
    if (res.ok) {
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
    setSavingPw(false);
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* Profile info form */}
      <form onSubmit={handleProfileSave} className="space-y-4">
        <h2 className="text-base font-semibold text-text">{t("editProfileTitle")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">{tAuth("firstNameLabel")}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={tAuth("firstNamePlaceholder")}
              className={field}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">{tAuth("lastNameLabel")}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={tAuth("lastNamePlaceholder")}
              className={field}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("phoneLabel")}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder")}
            className={field}
            dir="ltr"
          />
        </div>
        {profileStatus && (
          <p className={`text-sm ${profileStatus.ok ? "text-green-600" : "text-red-500"}`}>
            {profileStatus.msg}
          </p>
        )}
        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {savingProfile ? "..." : t("saveProfile")}
        </button>
      </form>

      <hr className="border-border" />

      {/* Change password form */}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h2 className="text-base font-semibold text-text">{t("changePasswordTitle")}</h2>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("currentPasswordLabel")}</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className={field}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("newPasswordLabel")}</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className={field}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("confirmPasswordLabel")}</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className={field}
            required
          />
        </div>
        {pwStatus && (
          <p className={`text-sm ${pwStatus.ok ? "text-green-600" : "text-red-500"}`}>
            {pwStatus.msg}
          </p>
        )}
        <button
          type="submit"
          disabled={savingPw}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {savingPw ? "..." : t("changePasswordBtn")}
        </button>
      </form>
    </div>
  );
}
