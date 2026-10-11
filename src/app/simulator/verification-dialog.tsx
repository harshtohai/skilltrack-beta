"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

/** DONE → verification link Dialog (replaces native alert). Copy state and
 * the clipboard call stay in the page (doneUrl drives the session there). */

export function VerificationDialog({
  doneUrl,
  copied,
  onCopy,
  onClose,
}: {
  doneUrl: string | null;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={doneUrl !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session complete</DialogTitle>
          <DialogDescription>
            The follow-up conversation finished and a verification link was generated for the
            trainee’s employment claim. Share it so the employer can confirm the outcome.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <code className="min-w-0 flex-1 break-all text-body-sm">{doneUrl}</code>
          <Button variant="outline" size="sm" onClick={onCopy} className="shrink-0 gap-2">
            {copied ? <Check className="text-success-text" /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
