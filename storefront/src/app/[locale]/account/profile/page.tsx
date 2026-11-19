import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import {
  getCurrentUser,
  updateMyProfile,
  changePassword,
} from "@/modules/auth/actions/authActions";
import { EditProfileModule } from "@/modules/auth/EditProfileModule";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/account/profile`);

  async function handleUpdateProfile(
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ): Promise<{ ok: boolean; error?: string }> {
    "use server";
    return updateMyProfile(firstName, lastName, phoneNumber);
  }

  async function handleChangePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> {
    "use server";
    return changePassword(currentPassword, newPassword);
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
        <EditProfileModule
          user={{ firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber }}
          updateProfile={handleUpdateProfile}
          changePassword={handleChangePassword}
        />
      </main>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: `${t("editProfile")} | PartZone` };
}
