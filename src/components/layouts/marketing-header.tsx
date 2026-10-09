"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Menu, ArrowRight } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "~/components/ui/sheet";

/**
 * Marketing header (S3 shell, §3.2/§4.6): sticky h-16 z-20 border-b
 * bg-background/80 backdrop-blur; container max-w-7xl; nav links h-9 px-3
 * rounded-lg hover:bg-accent; mobile: Sheet menu. One primary max (CL-05).
 */
function MarketingHeader({
  signedInHref,
  signedIn,
}: {
  signedInHref: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const links = (
    <>
      <Link
        href="#features"
        className="flex h-9 items-center rounded-lg px-3 text-body-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        Features
      </Link>
      <Link
        href="#how-it-works"
        className="flex h-9 items-center rounded-lg px-3 text-body-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        How it works
      </Link>
    </>
  );

  const actions = signedIn ? (
    <Button asChild size="default">
      <Link href={signedInHref}>
        Dashboard
        <ArrowRight />
      </Link>
    </Button>
  ) : (
    <>
      <Button asChild variant="ghost" size="default">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild size="default">
        <Link href="/signup">Get started</Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-title font-semibold text-foreground">SkillsTrack</span>
        </Link>

        {/* Desktop nav (§11: inline at md+) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Marketing">
          {links}
        </nav>
        <div className="hidden items-center gap-2 md:flex">{actions}</div>

        {/* Mobile: hamburger → Sheet (§11) */}
        <div className="flex items-center gap-2 md:hidden">
          {signedIn ? (
            <Button asChild size="sm">
              <Link href={signedInHref}>
                Dashboard
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
                    <GraduationCap className="size-4" />
                  </span>
                  SkillsTrack
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {links}
              </nav>
              {!signedIn ? (
                <div className="flex flex-col gap-2 p-4">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link href="/signup">Get started</Link>
                  </Button>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { MarketingHeader };
export { cn };
