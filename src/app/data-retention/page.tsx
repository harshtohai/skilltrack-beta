import Link from "next/link";

/**
 * Data retention — public static page (Bug Bag #22 / Idea Bag #5): the
 * landing footer and the terms page link /data-retention. Root layout,
 * no (app) shell, prose container, no interactive elements beyond links.
 * Matches the /terms page.
 */
export default function DataRetentionPage() {
  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-semibold tracking-tight">Data retention</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          This policy describes how long OutcomeTrack keeps each kind of data,
          what is deleted on request and what must be kept for the programme’s
          audit trail.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Enrolment and outcome records
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Enrolment details (institute, centre, course, batch) and employment
          outcomes (status, employer, role and salary band reported at 30 and
          90 days) are kept for the life of the programme and its reporting
          cycles. They are the basis of the placement, retention and
          wage-progression statistics the programme publishes, so they are not
          deleted quietly.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Verification artifacts
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Employer verification records — the verification token, the
          employer’s confirmation and the outcome event it produced — are kept
          so that any placement claim can be traced back to who confirmed it
          and when. Expired tokens are kept in an expired state rather than
          deleted.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Audit logs
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Audit logs are immutable and append-only. They record consent
          events, record changes and verification actions. They are never
          edited or deleted — including on a deletion request. That is what
          makes them reliable as an audit trail.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Deletion on request
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          A trainee can request deletion of their personal data — name,
          contact details and self-described profile fields — through their
          training institute. Employer account data is deleted when an
          employer account is closed. Where a record must be kept for the
          audit trail, we delete the personal data and keep the minimum detail
          the statistics need.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Retained for legal and audit purposes
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>Immutable audit logs, as described above.</li>
          <li>
            Employer-confirmed outcome events needed to justify reported
            placement numbers.
          </li>
          <li>
            Aggregates already published or exported — these are de-identified
            and contain no contact details.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Follow-up data
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Responses you give in WhatsApp or email follow-ups are stored as
          part of your outcome record and follow the same rules as the rest of
          it. The message threads themselves stay in WhatsApp and your
          mailbox.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Questions</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          How your data is collected and who sees it is described in the{" "}
          <Link href="/privacy" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
            privacy policy
          </Link>
          . To request access, correction or deletion, contact your training
          institute.
        </p>

        <div className="mt-12 border-t pt-6">
          <Link
            href="/"
            className="rounded-sm text-body-sm text-muted-foreground underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
