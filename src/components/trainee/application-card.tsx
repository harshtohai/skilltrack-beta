import { Check, Copy, Mail } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { date } from "~/lib/format";
import type { MyApplication } from "~/lib/job-board-contracts";

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const APPLICATION_STATUS_VARIANTS: Record<
  string,
  "info" | "warning" | "success" | "destructive" | "secondary"
> = {
  APPLIED: "info",
  SHORTLISTED: "warning",
  HIRED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "secondary",
};

export function ApplicationCard({
  app,
  onWithdraw,
  copied,
  onCopy,
}: {
  app: MyApplication;
  onWithdraw: (app: MyApplication) => void;
  copied: boolean;
  onCopy: (email: string) => void;
}) {
  const email = app.employerContactEmail;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-body-sm font-medium">{app.jobTitle}</p>
            <p className="text-caption text-muted-foreground">
              {app.companyName} · {app.district}
            </p>
            <p className="text-caption text-muted-foreground mt-1">
              Applied {date(app.appliedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={APPLICATION_STATUS_VARIANTS[app.status] ?? "secondary"}
            >
              {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
            </Badge>
            {app.viewedAt && <Badge variant="outline">Viewed</Badge>}
            {(app.status === "APPLIED" || app.status === "SHORTLISTED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw(app)}
              >
                Withdraw
              </Button>
            )}
          </div>
        </div>

        {/* Symmetric contact reveal: email only once SHORTLISTED */}
        {email && (
          <div className="bg-muted/50 mt-3 flex items-center justify-between gap-2 rounded-md p-2">
            <div className="text-caption text-muted-foreground flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <span className="font-mono">{email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-caption h-7 gap-1"
              onClick={() => onCopy(email)}
            >
              {copied ? (
                <Check className="text-success-text h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
