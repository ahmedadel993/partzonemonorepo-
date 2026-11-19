import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/shared/ui/Header";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { getCurrentUser, getMyAddresses, addAddress, deleteAddress } from "@/modules/auth/actions/authActions";
import type { Address } from "@/modules/auth/types";
import { AddressesPageModule } from "@/modules/auth/AddressesPageModule";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function AddressesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error: errorParam } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/${locale}/account/addresses`);

  const addresses = await getMyAddresses();

  async function handleDelete(formData: FormData) {
    "use server";
    const addressId = formData.get("addressId") as string;
    if (addressId) await deleteAddress(addressId);
    redirect(`/${locale}/account/addresses`);
  }

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
    const result = await addAddress(input);
    if (!result) redirect(`/${locale}/account/addresses?error=add_failed`);
    redirect(`/${locale}/account/addresses`);
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <AddressesPageModule
        addresses={addresses}
        locale={locale}
        errorParam={errorParam}
        handleDelete={handleDelete}
        handleAdd={handleAdd}
      />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "address" });
  return { title: `${t("title")} | PartZone` };
}
