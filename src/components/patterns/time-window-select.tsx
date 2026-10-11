"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const TIME_WINDOWS = [
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "24m", label: "Last 24 Months" },
  { value: "all", label: "All Time" },
];

/** Time-window select shared by the admin + institute analytics toolbars. */
function TimeWindowSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-col-xl" aria-label="Time window">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TIME_WINDOWS.map((tw) => (
          <SelectItem key={tw.value} value={tw.value}>
            {tw.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { TimeWindowSelect };
