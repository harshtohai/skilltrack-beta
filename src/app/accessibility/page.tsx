import Link from "next/link";

/**
 * Accessibility statement — public static page (Bug Bag #22 / Idea Bag #5):
 * the landing footer links /accessibility. Root layout, no (app) shell,
 * prose container, no interactive elements beyond links. Matches the /terms
 * page. Accessibility claims reference real patterns in the app (§12):
 * data-table aria labels/aria-sort/aria-current, focus-visible rings,
 * semantic HTML.
 */
export default function AccessibilityPage() {
  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-semibold tracking-tight">
          Accessibility statement
        </h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          SkillsTrack should be usable by everyone, including people who rely
          on assistive technology or the keyboard alone. This statement
          describes the patterns we follow, what we know is not yet right and
          how to tell us.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Our approach
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          The app targets WCAG 2.1 AA-informed patterns rather than a formal
          certification. Every screen is built with the same conventions —
          semantic HTML, keyboard reachability, visible focus and a label on
          everything interactive — so accessibility is part of the pattern,
          not a per-page patch.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          What we do
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            Semantic HTML: real table elements with column headers marked up
            with scope, one h1 per page, lists as lists, buttons as buttons
            and navigation as links.
          </li>
          <li>
            Keyboard: every action is reachable by keyboard and tab order
            follows visual order. Focus rings are never removed.
          </li>
          <li>
            Labels: icon-only controls carry an aria-label — the table
            pagination buttons (“Previous page”, “Next page”), search inputs
            and row-selection checkboxes all have one.
          </li>
          <li>
            State: sorted column headers set aria-sort, the active page number
            sets aria-current=“page”, and loading rows show skeletons instead
            of a frozen page.
          </li>
          <li>
            Forms: every control has a label, validation errors are linked to
            their field, and required fields are marked with aria-required.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">Contrast</h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Text targets a 4.5:1 contrast ratio. The brand orange is used in a
          darker variant for text and links to meet it; the brighter brand
          fill is reserved for buttons and the brand mark.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Zoom and reflow
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          The layout reflows at 320px width and works at 200% zoom. Tables
          switch to stacked cards on small screens instead of forcing
          horizontal scroll.
        </p>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Known limitations
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-muted-foreground">
          <li>
            No formal third-party WCAG audit has been done yet — the patterns
            are informed by WCAG but not certified.
          </li>
          <li>
            The dot-matrix charts are decorative for assistive technology; the
            underlying numbers are not always available as text nearby.
          </li>
          <li>
            Follow-up conversations happen inside WhatsApp itself, where
            keyboard and screen-reader behaviour depends on WhatsApp, not
            SkillsTrack.
          </li>
          <li>
            The dashboard interface is English-only at present; follow-up
            conversations are available in English, Hindi and Marathi.
          </li>
        </ul>

        <h2 className="mt-10 text-h2 font-semibold tracking-tight">
          Reporting a problem
        </h2>
        <p className="mt-3 text-body-sm text-muted-foreground">
          If something blocks you — a control you cannot reach, text you
          cannot read — tell us. Trainees: contact your training institute and
          describe the page and what you were trying to do. Institutes,
          employers and administrators: route it through the programme
          coordinator.
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
