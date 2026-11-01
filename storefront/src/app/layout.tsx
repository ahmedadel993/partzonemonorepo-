import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  // html/body live here so Next.js 15 is satisfied.
  // lang and dir are injected by the [locale] layout via suppressHydrationWarning.
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
