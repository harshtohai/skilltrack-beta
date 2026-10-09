import Link from "next/link";

/**
 * Terms of use — public static page (Bug Bag #22 / Idea Bag #5): login and
 * signup link /terms. Root layout, no (app) shell, prose container, no
 * interactive elements beyond links.
 */
export default function TermsPage() {
  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-semibold tracking-tight">Terms of use</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          These terms govern the use of OutcomeTrack — a platform for tracking
          employment outcomes in government skilling programmes. By creating an
          account or using the platform, you agree to them.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Who the platform serves</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          OutcomeTrack is used by four kinds of accounts, each with its own
          access: trainees enrolled via a training institute, training
          institutes managing their centre&rsquo;s batches, employers posting jobs
          and verifying employment, and government administrators overseeing
          the programme.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Accounts and access</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>Provide accurate information when signing up — your name, contact details and district are used to route verification and follow-ups.</li>
          <li>Keep your credentials private. Access is role-based: you only see data relevant to your role.</li>
          <li>Trainee accounts are activated through a verification link sent to the email you registered with.</li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Employment outcome claims</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Employment outcomes may be self-reported by trainees or confirmed by
          employers. Claims that conflict are reviewed by government
          administrators. Deliberately false claims — by trainees or employers
          — undermine the programme and may lead to loss of platform access.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Acceptable use</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>Do not attempt to access accounts, cohorts or records outside your role.</li>
          <li>Do not misuse the follow-up channels (WhatsApp and email) — they are for programme communication only.</li>
          <li>Do not interfere with verification requests or audit records, which are kept immutable.</li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Communications</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Outcome tracking relies on follow-ups at roughly 30 and 90 days after
          placement, sent over WhatsApp and email. Verification links are sent
          by email. Consent for these communications is described in the{" "}
          <Link href="/consent" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
            Consent policy
          </Link>
          .
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Data and privacy</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          How your data is collected, stored and shared is described in the{" "}
          <Link href="/privacy" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
            Privacy policy
          </Link>{" "}
          and the{" "}
          <Link href="/data-retention" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
            Data retention policy
          </Link>
          . Trainee mobile numbers are stored encrypted and shown masked
          throughout the platform.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Availability</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          The platform is provided as-is. We aim to keep it available and
          correct, but maintenance windows and occasional outages may interrupt
          access.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Changes to these terms</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          These terms may be updated as the programme evolves. Material changes
          will be communicated to account holders.
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
