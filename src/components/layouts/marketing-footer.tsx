import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Marketing footer per design §4.13/§9.9: border-t py-12, 4-column link grid
 * at lg (2 at base), legal row text-caption text-muted-foreground.
 */
function MarketingFooter() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="size-5" />
              </span>
              <span className="text-title font-semibold text-foreground">OutcomeTrack</span>
            </div>
            <p className="max-w-prose text-body-sm text-muted-foreground">
              Longitudinal skilling outcomes platform for Maharashtra. Built for SIH 2026 PS-26135.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-body-sm font-medium text-foreground">Platform</h3>
            <ul className="space-y-2 text-body-sm text-muted-foreground">
              <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/trainees" className="transition-colors hover:text-foreground">Trainees</Link></li>
              <li><Link href="/employer/verify" className="transition-colors hover:text-foreground">Employer verification</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-body-sm font-medium text-foreground">Resources</h3>
            <ul className="space-y-2 text-body-sm text-muted-foreground">
              <li><Link href="#features" className="transition-colors hover:text-foreground">Features</Link></li>
              <li><Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link></li>
              <li><Link href="/api/v1/health" className="transition-colors hover:text-foreground">API health</Link></li>
              <li><Link href="/simulator" className="transition-colors hover:text-foreground">WhatsApp simulator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-body-sm font-medium text-foreground">Compliance</h3>
            <ul className="space-y-2 text-body-sm text-muted-foreground">
              <li><Link href="/privacy" className="transition-colors hover:text-foreground">Privacy policy</Link></li>
              <li><Link href="/consent" className="transition-colors hover:text-foreground">Consent management</Link></li>
              <li><Link href="/data-retention" className="transition-colors hover:text-foreground">Data retention</Link></li>
              <li><Link href="/accessibility" className="transition-colors hover:text-foreground">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-caption text-muted-foreground">
            © 2026 OutcomeTrack. Government of Maharashtra — Maharashtra State Innovation Society.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { MarketingFooter };
