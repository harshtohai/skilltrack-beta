"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "sonner";

const REASON_OPTIONS = [
  { value: "NO_JOBS", label: "No jobs nearby" },
  { value: "SKILLS_MISMATCH", label: "Skills mismatch" },
  { value: "FAMILY", label: "Family reasons" },
  { value: "HEALTH", label: "Health reasons" },
  { value: "OTHER", label: "Other" },
] as const;

/** Can't-find-a-job signal — owns the reason choice + submit; open state is upstream. */
export function JobSeekSignalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [signalReason, setSignalReason] = useState("");
  const [signaling, setSignaling] = useState(false);

  // Fresh reason every time the dialog opens.
  useEffect(() => {
    if (open) setSignalReason("");
  }, [open]);

  const handleSignal = async () => {
    if (!signalReason || signaling) return;
    setSignaling(true);
    try {
      const res = await fetch("/api/v1/trainee/job-seek-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: signalReason }),
      });
      if (res.ok) {
        toast.success("Signal recorded — thank you");
        onOpenChange(false);
        setSignalReason("");
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        toast.error("Could not record signal", {
          description: json.error?.message ?? "Something went wrong",
        });
      }
    } catch {
      toast.error("Could not record signal", {
        description: "Something went wrong",
      });
    } finally {
      setSignaling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Can't find a job?`}</DialogTitle>
          <DialogDescription>
            Tell us why — this helps us bring more jobs to your district.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {REASON_OPTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSignalReason(r.value)}
              className={`text-body-sm w-full rounded-md border p-3 text-left transition-colors ${
                signalReason === r.value
                  ? "border-primary bg-primary-soft font-medium"
                  : "hover:bg-muted/50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!signalReason || signaling}
            onClick={() => void handleSignal()}
          >
            {signaling && <Loader2 className="h-4 w-4 animate-spin" />}
            Send signal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
