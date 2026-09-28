import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";

export function BackLink({ href, label = "Back", className }: { href: string; label?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
