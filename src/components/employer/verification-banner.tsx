import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import type { EmployerVerificationStatus } from "~/lib/job-board-contracts";

/**
 * Verification banner gate (F25): PENDING/SUSPENDED/REJECTED employers see
 * the matching banner only — no job management or posting UI. Shared by the
 * employer dashboard and the post-job page. Returns null for VERIFIED.
 */
export function EmployerVerificationBanner({
  status,
}: {
  status: EmployerVerificationStatus | null;
}) {
  if (status === "PENDING") {
    return (
      <Alert variant="warning">
        <AlertTitle>Verification pending</AlertTitle>
        <AlertDescription>
          Your registration is under review. You can log in, and will be able to
          post jobs once an admin verifies your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Account suspended</AlertTitle>
        <AlertDescription>
          Job posting is disabled. Contact the skill mission team to reinstate
          your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "REJECTED") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Registration rejected</AlertTitle>
        <AlertDescription>
          Your employer registration was not approved. Contact the skill mission
          team for details.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
