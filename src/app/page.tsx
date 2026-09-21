import Link from "next/link";
import { GraduationCap, Building2, Users, Shield, TrendingUp, Target, ArrowRight, Phone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary-foreground">OutcomeTrack</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Shield className="h-4 w-4" />
                <span>Government of Maharashtra | SIH 2026 Problem Statement 26135</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
                Track Skills. Measure Impact.{' '}
                <span className="text-primary">Transform Lives.</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                OutcomeTrack is a longitudinal skilling-outcomes platform that creates consent-based trainee records,
                links training with employment signals, conducts automated follow-ups, and provides cohort, course,
                provider, district, and demographic analytics — all while protecting privacy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start Tracking Outcomes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Built for Outcome Measurement</h2>
              <p className="text-muted-foreground">
                Comprehensive features for tracking employment outcomes, skill gaps, and training impact
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Users}
                title="Consent-Based Trainee Records"
                description="Privacy-first onboarding with explicit consent capture via WhatsApp, Email, or in-person. Trainees control their data."
              />
              <FeatureCard
                icon={Building2}
                title="Employer Verification"
                description="Secure token-based verification links for employers to confirm employment, role, and salary band with evidence ladder."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Wage Progression & Retention"
                description="Track 30/90-day outcomes, 6/12/24-month retention, wage band mobility, and training relevance metrics."
              />
              <FeatureCard
                icon={Target}
                title="Skill Gap Identification"
                description="Capture non-placement reasons, skill mismatches, and attrition drivers to inform curriculum improvements."
              />
              <FeatureCard
                icon={GraduationCap}
                title="Multi-Programme Analytics"
                description="Cohort, course, provider, district, and demographic dashboards with SIDH-compatible export."
              />
              <FeatureCard
                icon={Phone}
                title="Multi-Channel Follow-Ups"
                description="Automated WhatsApp, Email, and SMS follow-ups with adaptive questionnaires and no-response handling."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground">
                From enrolment to longitudinal impact — automated, consent-driven, and verifiable
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <StepCard
                number="01"
                title="Enrol & Consent"
                description="Import trainees via CSV or SIDH adapter. Capture consent via WhatsApp/Email bot before any tracking begins."
              />
              <StepCard
                number="02"
                title="Certify & Schedule"
                description="Link certifications to cohorts. Auto-schedule 30/90-day follow-ups (and 6/12/24-month for retention)."
              />
              <StepCard
                number="03"
                title="Automated Follow-Up"
                description="Bot reaches out via WhatsApp/Email. Adaptive questionnaires capture employment status, employer, role, salary."
              />
              <StepCard
                number="04"
                title="Verify & Analyse"
                description="Employer verification links → evidence ladder. Dashboards show placement, retention, wage progression, skill gaps."
              />
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Transform Skilling Outcomes?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-primary-foreground/80">
              Join training providers, government agencies, and employers using OutcomeTrack to measure what matters.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-base font-medium text-primary hover:bg-primary-foreground/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-4 text-lg font-semibold">For Training Providers</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Track placement rates by course</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Identify skill gaps in curriculum</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> SIDH-compatible reporting</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Provider accountability dashboards</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold">For Government Agencies</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> District & demographic analytics</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Policy-grade outcome data</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Resource allocation insights</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Longitudinal impact measurement</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold">For Trainees</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Own your employment timeline</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Upload certificates securely</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Self-assess skills</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Privacy-controlled data sharing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">OutcomeTrack</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Longitudinal skilling outcomes platform for Maharashtra. Built for SIH 2026 PS-26135.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/cohorts" className="hover:text-foreground transition-colors">Cohorts</Link></li>
                <li><Link href="/trainees" className="hover:text-foreground transition-colors">Trainees</Link></li>
                <li><Link href="/employer/verify" className="hover:text-foreground transition-colors">Employer Verification</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/api/v1/health" className="hover:text-foreground transition-colors">API Health</Link></li>
                <li><Link href="/simulator" className="hover:text-foreground transition-colors">WhatsApp Simulator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Compliance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/consent" className="hover:text-foreground transition-colors">Consent Management</Link></li>
                <li><Link href="/data-retention" className="hover:text-foreground transition-colors">Data Retention</Link></li>
                <li><Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 OutcomeTrack. Government of Maharashtra — Maharashtra State Innovation Society.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
          {number}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}