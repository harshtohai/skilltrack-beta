import Link from "next/link";

/**
 * Privacy policy — public static page (Bug Bag #22 / Idea Bag #5): the
 * landing footer links /privacy. Root layout, no (app) shell, prose
 * container, no interactive elements beyond links. Matches the /terms page.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-semibold tracking-tight">Privacy policy</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          This policy describes what SkillsTrack collects, how it is stored,
          who can see it and what you can do about it. SkillsTrack tracks
          employment outcomes for government skilling programmes; trainees
          enrol through a training institute.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          What we collect
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            Identity: your full name, gender (including self-described) and
            district.
          </li>
          <li>Contact: your email address and 10-digit mobile number.</li>
          <li>
            Enrolment: the training institute, centre, course and batch you
            are enrolled in.
          </li>
          <li>
            Outcomes: employment status, employer, role and salary band as
            reported in 30/90-day follow-ups, and the same details as
            confirmed by employers.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          How it is stored
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Trainee mobile numbers are stored encrypted at rest, with a hash
          kept for matching — the plain number is never needed for lookups and
          is shown masked throughout the platform (for example ******3210).
          Everything else is stored in the programme database, and access is
          role-based (see below). We do not sell contact details or use them
          for advertising.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Who can see your data
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            Training institutes see the trainees enrolled at their own
            centre(s) — their batches, enrolments and follow-up responses.
          </li>
          <li>
            Employers see only the data relevant to a claim: the name and
            employment details to confirm, and applications to their own jobs.
            They never see a trainee’s mobile number.
          </li>
          <li>
            Government administrators see programme-wide records and the
            aggregates built from them, used for district, course and
            demographic reporting.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          WhatsApp and email
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          WhatsApp is the primary channel for follow-ups; email is used for
          enrolment verification and sign-in links. Messages are sent by the
          SkillsTrack bot to the contact details you registered with, and
          your follow-up responses become part of your outcome record.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Your rights
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            Access: your own record is visible in the trainee portal, including
            your consent status.
          </li>
          <li>
            Correction: you can update your profile details; where a field is
            verified (like your enrolment), corrections go through your
            training institute.
          </li>
          <li>
            Deletion: you can request deletion of your personal data through
            your training institute. What is and is not deletable is described
            in the{" "}
            <Link href="/data-retention" className="text-primary-strong underline transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              data retention policy
            </Link>
            .
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Contact</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Trainees: start with your training institute. Institutes, employers
          and government administrators: route questions through the programme
          coordinator. Data protection concerns can be raised with the
          programme team at the Maharashtra State Innovation Society.
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
