"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileForm,
  type ChangePasswordForm,
} from "@/modules/auth/schemas";

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

  const [savingProfile, startProfileTransition] = useTransition();
  const [savingPw, startPwTransition] = useTransition();

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    setError: setProfileError,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? "",
    },
  });

  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    setError: setPwError,
    formState: { errors: pwErrors },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const onProfileSave = (vals: UpdateProfileForm) => {
    startProfileTransition(async () => {
      const res = await updateProfile(vals.firstName, vals.lastName, vals.phoneNumber || undefined);
      if (!res.ok) {
        setProfileError("root", { message: res.error ?? "Error" });
      } else {
        router.refresh();
      }
    });
  };

  const onPasswordChange = (vals: ChangePasswordForm) => {
    startPwTransition(async () => {
      const res = await changePassword(vals.currentPassword, vals.newPassword);
      if (!res.ok) {
        setPwError("root", { message: res.error ?? "Error" });
      } else {
        resetPw();
      }
    });
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* Profile info form */}
      <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
        <h2 className="text-base font-semibold text-text">{t("editProfileTitle")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">{tAuth("firstNameLabel")}</label>
            <input
              placeholder={tAuth("firstNamePlaceholder")}
              className={field}
              {...regProfile("firstName")}
            />
            {profileErrors.firstName && (
              <p className="text-xs text-danger mt-1">{profileErrors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">{tAuth("lastNameLabel")}</label>
            <input
              placeholder={tAuth("lastNamePlaceholder")}
              className={field}
              {...regProfile("lastName")}
            />
            {profileErrors.lastName && (
              <p className="text-xs text-danger mt-1">{profileErrors.lastName.message}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("phoneLabel")}</label>
          <input
            placeholder={t("phonePlaceholder")}
            className={field}
            dir="ltr"
            {...regProfile("phoneNumber")}
          />
        </div>
        {profileErrors.root && (
          <p className="text-sm text-danger">{profileErrors.root.message}</p>
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
      <form onSubmit={handlePwSubmit(onPasswordChange)} className="space-y-4">
        <h2 className="text-base font-semibold text-text">{t("changePasswordTitle")}</h2>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("currentPasswordLabel")}</label>
          <input type="password" className={field} {...regPw("currentPassword")} />
          {pwErrors.currentPassword && (
            <p className="text-xs text-danger mt-1">{pwErrors.currentPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("newPasswordLabel")}</label>
          <input type="password" className={field} {...regPw("newPassword")} />
          {pwErrors.newPassword && (
            <p className="text-xs text-danger mt-1">{pwErrors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">{t("confirmPasswordLabel")}</label>
          <input type="password" className={field} {...regPw("confirmPassword")} />
          {pwErrors.confirmPassword && (
            <p className="text-xs text-danger mt-1">{pwErrors.confirmPassword.message}</p>
          )}
        </div>
        {pwErrors.root && (
          <p className="text-sm text-danger">{pwErrors.root.message}</p>
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
