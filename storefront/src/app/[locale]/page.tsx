import { useTranslations } from "next-intl";
import { Header } from "@/shared/ui/Header";

// [Phase 2+] PageBlockRenderer will fetch and render dynamic page blocks from backend.
function PageBlockRendererStub() {
  return (
    <section className="py-12 text-center space-y-4">
      <p className="text-text-muted text-sm">
        [Page blocks loaded from Marketing module — Phase 2+]
      </p>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero — driven by PageBlock (Marketing module) */}
        <PageBlockRendererStub />
      </main>
    </>
  );
}
