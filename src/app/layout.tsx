import "~/styles/globals.css";
// Fontsource fallback per Idea Bag #2: the build environment cannot reach
// fonts.gstatic.com, so next/font/google fails `next build`. Self-hosted
// woff2 via @fontsource keeps the build offline-safe.
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import { Providers } from "~/components/providers";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OutcomeTrack — Skilling Outcomes Platform",
  description: "Longitudinal skilling outcomes and impact measurement system",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
