import "~/styles/globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "~/components/providers";

import { type Metadata } from "next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OutcomeTrack — Skilling Outcomes Platform",
  description: "Longitudinal skilling outcomes and impact measurement system",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
