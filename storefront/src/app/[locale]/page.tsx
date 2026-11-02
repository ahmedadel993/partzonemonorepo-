import { Header } from "@/shared/ui/Header";
import { PageBlockRenderer } from "@/modules/marketing/components/PageBlockRenderer";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  return (
    <>
      <Header />
      <main>
        <PageBlockRenderer locale={locale} />
      </main>
    </>
  );
}
