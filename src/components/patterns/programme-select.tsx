"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

/**
 * Programme filter select shared by the admin + institute analytics toolbars.
 * Empty string means "all programmes" — the mapping to/from the "all" item
 * lives here so both call sites stay identical.
 */
function ProgrammeSelect({
  value,
  onValueChange,
}: {
  /** "" = all programmes. */
  value: string;
  /** Receives "" when "all" is picked. */
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      value={value === "" ? "all" : value}
      onValueChange={(v) => onValueChange(v === "all" ? "" : v)}
    >
      <SelectTrigger aria-label="Programme">
        <SelectValue placeholder="All Programmes" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Programmes</SelectItem>
        <SelectItem value="pmkvy-it">PMKVY IT/ITeS</SelectItem>
        <SelectItem value="pmkvy-hc">PMKVY Healthcare</SelectItem>
        <SelectItem value="pmkvy-mfg">PMKVY Manufacturing</SelectItem>
        <SelectItem value="ddgky-rtl">DDU-GKY Retail</SelectItem>
        <SelectItem value="ssm-const">SSM Construction</SelectItem>
      </SelectContent>
    </Select>
  );
}

export { ProgrammeSelect };
