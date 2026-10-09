"use client";

import * as React from "react";
import { Drawer } from "vaul";

import { cn } from "~/lib/utils";
import { Dialog, DialogContent } from "~/components/ui/dialog";

/**
 * Responsive overlay per design §4.8/§11: bottom Drawer at <md (90svh, grab
 * handle), centered Dialog at md+. Pair ResponsiveDialog (Root switcher) with
 * ResponsiveDialogContent (content branch) — do not pass plain DialogContent.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(window.innerWidth < 768);
    mq.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < 768);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}

function ResponsiveDialog(props: React.ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile();
  if (isMobile) return <Drawer.Root {...props} />;
  return <Dialog {...props} />;
}

function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content
          data-slot="responsive-drawer-content"
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[90svh] flex-col rounded-t-xl border-t bg-popover outline-none",
            className,
          )}
          {...props}
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          <div className="overflow-y-auto p-6 pt-4">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    );
  }
  return (
    <DialogContent className={className}>{children}</DialogContent>
  );
}

export { ResponsiveDialog, ResponsiveDialogContent };
