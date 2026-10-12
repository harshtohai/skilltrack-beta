import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export interface RejectTarget {
  jobId: string;
  applicationId: string;
  name: string;
}

/** Reject is destructive — confirmed with the object + consequence named (CL-18). */
export function RejectApplicantDialog({
  target,
  busy,
  onCancel,
  onConfirm,
}: {
  target: RejectTarget | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {target?.name}?</DialogTitle>
          <DialogDescription>
            Their application will be marked rejected and they will no longer be
            considered for this opening. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>
            {busy ? "Rejecting…" : "Reject applicant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
