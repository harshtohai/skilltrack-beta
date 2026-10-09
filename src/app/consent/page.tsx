import Link from "next/link";

/**
 * Consent policy — public static page (Bug Bag #22 / Idea Bag #5): the
 * landing footer and the signup consent checkbox link /consent. Root layout,
 * no (app) shell, prose container, no interactive elements beyond links.
 * Matches the /terms page.
 */
export default function ConsentPolicyPage() {
  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-semibold tracking-tight">Consent policy</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          This policy describes the consent OutcomeTrack asks for, what it
          covers and how to withdraw it. Consent is asked before any tracking
          begins — nothing is tracked without it.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          When consent is asked
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          At signup, before any tracking begins. The signup form shows a single
          consent checkbox alongside links to the terms, the{" "}
          <Link href="/privacy" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
            privacy policy
          </Link>{" "}
          and this policy. Trainees enrolled by a training institute give
          consent the same way, through the WhatsApp or email bot, before
          their first follow-up is scheduled.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          What consent covers
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            Outcome tracking: your answers at the 30/90-day follow-ups becoming
            part of the programme record.
          </li>
          <li>
            WhatsApp follow-ups: the OutcomeTrack bot contacting you on your
            registered mobile number at roughly 30 and 90 days after
            placement.
          </li>
          <li>
            Employer verification: an employer confirming the employment
            details you reported.
          </li>
          <li>
            Aggregates: your record counting toward the district, course and
            demographic statistics shown to government administrators.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          What consent does not cover
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          It does not cover advertising, or sharing your contact details with
          anyone for their own use. Employers never see your mobile number —
          it stays masked. Withdrawing consent does not affect your enrolment
          or your certification.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Withdrawing consent
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Your trainee profile shows a consent row with its current status and
          when consent was given. To withdraw, contact your training
          institute — they can record the withdrawal if you cannot sign in.
          Consent is yours to withdraw at any time, for any reason.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          What happens on withdrawal
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            Follow-ups stop: the bot sends no further questionnaires to your
            number or email.
          </li>
          <li>
            Your record stops counting toward new aggregates and exports.
          </li>
          <li>
            What is already recorded is handled under the{" "}
            <Link href="/data-retention" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              data retention policy
            </Link>{" "}
            — including the audit entry of the consent itself, which is kept
            immutable.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Giving consent again
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          You can give consent again at any time through your training
          institute. Tracking resumes from the next scheduled follow-up;
          nothing needs to be re-entered from scratch.
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
