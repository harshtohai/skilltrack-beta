import Link from "next/link";

/**
 * Wordmark link back to the marketing home, shared by the split-shell auth
 * pages (§9.3 signup + employer register). Login keeps its own centered
 * GraduationCap variant above the card.
 */
export function AuthLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
          <path d="M22 10L12 5 2 10l10 5 10-5Z" />
          <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
        </svg>
      </span>
      <span className="text-title font-semibold text-foreground">
        SkillsTrack
      </span>
    </Link>
  );
}
