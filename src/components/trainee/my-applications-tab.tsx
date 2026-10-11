"use client";

import { useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { EmptyState } from "~/components/patterns/empty-state";
import { toast } from "sonner";
import { ApplicationCard } from "~/components/trainee/application-card";
import type { MyApplication } from "~/lib/job-board-contracts";

/** My Applications tab: list of application cards + copy-to-clipboard state. */
export function MyApplicationsTab({
  applications,
  onWithdraw,
}: {
  applications: MyApplication[];
  onWithdraw: (app: MyApplication) => void;
}) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      toast.error("Could not copy email", {
        description: "Copy it manually instead.",
      });
    }
  };

  return applications.length === 0 ? (
    <EmptyState
      icon={<Briefcase />}
      title="No applications yet"
      description="Apply to a job and it will show up here."
    />
  ) : (
    <div className="space-y-3">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          app={app}
          onWithdraw={onWithdraw}
          copied={copiedEmail === app.employerContactEmail}
          onCopy={(email) => void copyEmail(email)}
        />
      ))}
    </div>
  );
}

/** Withdraw confirm step — rendered outside the tabs, state lives upstream. */
export function WithdrawApplicationDialog({
  target,
  busy,
  onCancel,
  onConfirm,
}: {
  target: MyApplication | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw application?</AlertDialogTitle>
          <AlertDialogDescription>
            You will stop being considered for {target?.jobTitle} at{" "}
            {target?.companyName}. You can apply again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Withdraw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
