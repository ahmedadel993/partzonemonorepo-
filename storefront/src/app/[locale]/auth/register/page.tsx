import { RegisterPageModule } from "@/modules/auth/RegisterPageModule";

export default function RegisterPage() {
  return <RegisterPageModule />;
}

export function generateMetadata() {
  return { title: "إنشاء حساب | PartZone" };
}
