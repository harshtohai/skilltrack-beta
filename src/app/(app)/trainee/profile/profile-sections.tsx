"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/patterns/skeleton";
import { cn } from "~/lib/utils";

/**
 * Trainee profile sections (§9.7 settings pattern): sub-nav, loading skeleton,
 * and the trainee ID card with copy. The editable form lives in
 * profile-details-form.tsx; the verified-info card (email change + lock +
 * consent) in profile-verified-info.tsx; certificates/employment/outcome
 * cards in profile-record-cards.tsx. Statuses via StatusBadge only
 * (§4.10/CL-12).
 */

export interface TraineeProfile {
  id: string;
  publicId: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  district: string;
  language: string;
  gender: string;
  genderSelfDescribed: string | null;
  consentGiven: boolean;
  consentGivenAt: string | null;
  consentMethod: string | null;
  certificates: Array<{ id: string; name: string; issuer: string; issueDate: string; expiryDate: string | null; fileUrl: string | null }>;
  employmentHistory: Array<{ id: string; employer: string; role: string | null; salaryBand: string | null; startDate: string; endDate: string | null; isCurrent: boolean }>;
  outcomeEvents: Array<{ id: string; checkpointDays: number; outcomeStatus: string; verificationStatus: string; createdAt: string }>;
}

const SUB_NAV = [
  { label: "Profile details", href: "#profile-details" },
  { label: "Verified info", href: "#verified-info" },
  { label: "Certificates", href: "#certificates" },
  { label: "Employment", href: "#employment" },
  { label: "Outcomes", href: "#outcomes" },
] as const;

export function ProfileSkeleton() {
  return (
    <div className="lg:flex lg:gap-8" aria-busy>
      <Skeleton className="hidden lg:block lg:w-56 lg:shrink-0" />
      <div className="min-w-0 flex-1 space-y-6 lg:max-w-3xl">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Sub-nav (§9.7): vertical, items h-9, active bg-accent. Scroll-spy state is
 * local — nothing outside the nav reads it. */
export function ProfileSubNav() {
  const [activeSection, setActiveSection] = useState<string>("profile-details");

  return (
    <nav className="hidden lg:block lg:w-56 lg:shrink-0" aria-label="Profile sections">
      <div className="sticky top-6 flex flex-col gap-0.5">
        {SUB_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setActiveSection(item.href.slice(1))}
            aria-current={activeSection === item.href.slice(1) ? "true" : undefined}
            className={cn(
              "flex h-9 items-center rounded-lg px-3 text-body-sm transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              activeSection === item.href.slice(1) && "bg-accent font-medium",
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** Trainee ID — prominent + copyable. Copy state is local to the card. */
export function TraineeIdCard({ publicId }: { publicId: string }) {
  const [copied, setCopied] = useState(false);

  const copyTraineeId = async () => {
    try {
      await navigator.clipboard.writeText(publicId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy trainee ID");
    }
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
          Your Trainee ID
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-2xl font-semibold text-primary-strong tabular-nums">{publicId}</span>
          <Button variant="outline" size="sm" onClick={() => void copyTraineeId()} className="gap-2">
            {copied ? <Check className="text-success-text" /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-2 text-caption text-muted-foreground">
          Share this ID with your training center or employer for verification.
        </p>
      </CardContent>
    </Card>
  );
}

