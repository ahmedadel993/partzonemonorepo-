import { redirect } from "next/navigation";
import { getCurrentUser, logout } from "@/modules/auth/actions/authActions";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { AccountPageModule } from "@/modules/auth/AccountPageModule";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/account`);

  async function handleLogout() {
    "use server";
    await logout();
    redirect(`/${locale}`);
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <AccountPageModule user={user} locale={locale} handleLogout={handleLogout} />
    </>
  );
}
