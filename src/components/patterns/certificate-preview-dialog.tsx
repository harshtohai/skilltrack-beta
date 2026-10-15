"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

/**
 * In-browser certificate preview (issue #113): renders the certificate file
 * (PDF/image) inside an iframe pointed at the caller's session-gated file
 * route — the browser follows the 302 to the short-lived signed URL, so no
 * extra access logic lives here. "Open in new tab" stays as the escape hatch
 * (and the download path, since iframes can't force downloads).
 */
export function CertificatePreviewDialog({
  open,
  onOpenChange,
  name,
  fileSrc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  fileSrc: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-title">{name}</DialogTitle>
          <DialogDescription>Preview — rendered from the stored file via a short-lived secure link.</DialogDescription>
        </DialogHeader>
        {open && fileSrc ? (
          <iframe
            src={fileSrc}
            title={`Preview of ${name}`}
            className="h-[65vh] w-full rounded-lg border bg-muted/30"
          />
        ) : null}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={fileSrc} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden /> Open in new tab
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
