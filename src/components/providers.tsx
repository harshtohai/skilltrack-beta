"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

/**
 * Global client providers: class-based theming (DM-10) + Sonner toasts (§4.9).
 * Toast styling is token-based; position bottom-right (top on mobile via Sonner default).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-lg !border !border-border !bg-popover !text-popover-foreground !shadow-md !text-body-sm",
            title: "!font-medium",
            description: "!text-muted-foreground",
          },
        }}
      />
    </ThemeProvider>
  );
}
