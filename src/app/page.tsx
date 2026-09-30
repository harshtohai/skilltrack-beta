import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Users,
  Shield,
  TrendingUp,
  Target,
  ArrowRight,
  Phone,
  Check,
  type LucideIcon,
} from "lucide-react";

import { auth } from "~/lib/auth";
import { roleHomeRoutes } from "~/lib/protected-routes";
import { MarketingHeader } from "~/components/layouts/marketing-header";
import { MarketingFooter } from "~/components/layouts/marketing-footer";
import { Button } from "~/components/ui/button";
import { DotSparkline } from "~/components/viz/dot-sparkline";

/**
 * Landing page per design §9.9 + S3 shell: Header → Hero → Feature grid →
 * How it works → Audiences → CTA band → Footer. One primary per viewport
 * section (CL-05); section rhythm py-24/py-16; tokens only (CL-03); orange
 * text uses text-primary-strong (D-02).
 */

const HERO_SPARK: number[] = [4, 6, 5, 7, 8, 6, 9, 10, 8, 11, 12, 10, 13, 12, 14, 15, 13, 16, 15, 17];

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Users, title: "Consent-based trainee records", description: "Privacy-first onboarding with explicit consent capture via WhatsApp, email, or in person. Trainees control their data." },
  { icon: Building2, title: "Employer verification", description: "Secure token-based verification links for employers to confirm employment, role, and salary band with an evidence ladder." },
  { icon: TrendingUp, title: "Wage progression & retention", description: "Track 30/90-day outcomes, 6/12/24-month retention, wage band mobility, and training relevance metrics." },
  { icon: Target, title: "Skill gap identification", description: "Capture non-placement reasons, skill mismatches, and attrition drivers to inform curriculum improvements." },
  { icon: GraduationCap, title: "Multi-programme analytics", description: "Cohort, course, provider, district, and demographic dashboards with SIDH-compatible export." },
  { icon: Phone, title: "Multi-channel follow-ups", description: "Automated WhatsApp, email, and SMS follow-ups with adaptive questionnaires and no-response handling." },
];

const STEPS: { number: string; title: string; description: string }[] = [
  { number: "01", title: "Enrol & consent", description: "Import trainees via CSV or SIDH adapter. Capture consent via WhatsApp/email bot before any tracking begins." },
  { number: "02", title: "Certify & schedule", description: "Link certifications to cohorts. Auto-schedule 30/90-day follow-ups (and 6/12/24-month for retention)." },
  { number: "03", title: "Automated follow-up", description: "Bot reaches out via WhatsApp/email. Adaptive questionnaires capture employment status, employer, role, salary." },
  { number: "04", title: "Verify & analyse", description: "Employer verification links → evidence ladder. Dashboards show placement, retention, wage progression, skill gaps." },
];

const AUDIENCES: { title: string; items: string[] }[] = [
  {
    title: "For training providers",
    items: ["Track placement rates by course", "Identify skill gaps in curriculum", "SIDH-compatible reporting", "Provider accountability dashboards"],
  },
  {
    title: "For government agencies",
    items: ["District & demographic analytics", "Policy-grade outcome data", "Resource allocation insights", "Longitudinal impact measurement"],
  },
  {
    title: "For trainees",
    items: ["Own your employment timeline", "Upload certificates securely", "Self-assess skills", "Privacy-controlled data sharing"],
  },
];

export default async function LandingPage() {
  const session = await auth();
  const role = session?.user?.role;
  const dashboardHref = role ? roleHomeRoutes[role] : "/dashboard";
  const signedIn = Boolean(role);
  const primaryHref = signedIn ? dashboardHref : "/signup";

  return (
    <div className="min-h-svh bg-background">
      <MarketingHeader signedInHref={dashboardHref} signedIn={signedIn} />

      <main>
        {/* Hero (§4.13): centered, py-24 md:py-32, display type at md+ */}
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-body-sm font-medium text-primary-strong">
                <Shield className="size-4" />
                <span>Government of Maharashtra | SIH 2026 Problem statement 26135</span>
              </div>
              <h1 className="mb-6 text-h1 font-semibold tracking-tight text-foreground md:text-display">
                Track skills. Measure impact.{" "}
                <span className="text-primary-strong">Transform lives.</span>
              </h1>
              <p className="mb-10 max-w-2xl text-title text-muted-foreground">
                OutcomeTrack is a longitudinal skilling-outcomes platform that creates consent-based
                trainee records, links training with employment signals, conducts automated
                follow-ups, and provides cohort, course, provider, district, and demographic
                analytics — all while protecting privacy.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={primaryHref}>
                    {signedIn ? "Go to dashboard" : "Start tracking outcomes"}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              {/* Signature dot-matrix band (on-brand, decorative) */}
              <div className="mt-14 w-full max-w-xl rounded-2xl border bg-card p-6" aria-hidden>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-caption font-medium text-muted-foreground">Placement outcomes, last 20 months</span>
                  <span className="inline-flex items-center gap-1.5 text-caption text-success-text">
                    <span className="size-1.5 rounded-full bg-success" />
                    On track
                  </span>
                </div>
                <DotSparkline data={HERO_SPARK} color="var(--chart-1)" ariaLabel="Decorative placement trend" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid (§4.13): 3×2, icon chips, py-24/py-16 rhythm */}
        <section id="features" className="bg-background py-16 md:py-24 lg:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-h2 font-semibold tracking-tight text-foreground">Built for outcome measurement</h2>
              <p className="text-body text-muted-foreground">
                Comprehensive features for tracking employment outcomes, skill gaps, and training impact
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border bg-card p-6"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary-strong [&_svg]:size-5">
                    <feature.icon />
                  </span>
                  <h3 className="mt-4 text-title font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-body-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-h2 font-semibold tracking-tight text-foreground">How it works</h2>
              <p className="text-body text-muted-foreground">
                From enrolment to longitudinal impact — automated, consent-driven, and verifiable
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.number} className="rounded-2xl border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong text-body font-semibold tabular-nums">
                      {step.number}
                    </span>
                    <h3 className="text-body-sm font-medium text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-body-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audiences */}
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <div key={audience.title} className="rounded-2xl border bg-card p-6">
                  <h3 className="mb-4 text-title font-medium text-foreground">{audience.title}</h3>
                  <ul className="space-y-2 text-body-sm text-muted-foreground">
                    {audience.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band (§4.13): bg-foreground inversion, one lg primary */}
        <section className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="rounded-2xl bg-foreground p-10 text-center text-background md:p-16">
              <h2 className="mb-6 text-h2 font-semibold tracking-tight md:text-h1">
                Ready to transform skilling outcomes?
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-body text-background/80">
                Join training providers, government agencies, and employers using OutcomeTrack to measure what matters.
              </p>
              <Button asChild size="lg">
                <Link href={primaryHref}>
                  {signedIn ? "Go to dashboard" : "Get started"}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
