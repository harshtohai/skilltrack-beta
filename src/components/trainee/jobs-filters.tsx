import type { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FilterBar } from "~/components/patterns/filter-bar";
import { EMPLOYMENT_TYPE_LABELS } from "~/lib/job-board-labels";
import type { JobFilter } from "~/server/job-relevance";

/** Client-side filters for the jobs tab — no refetch (§9.4 toolbar row). */
export function JobsFilters({
  filters,
  onFiltersChange,
  districtOptions,
}: {
  filters: JobFilter;
  onFiltersChange: Dispatch<SetStateAction<JobFilter>>;
  districtOptions: string[];
}) {
  const filtersActive =
    filters.district !== "" ||
    filters.workMode !== "" ||
    filters.employmentType !== "";

  return (
    <FilterBar
      className="mb-4"
      onClear={
        filtersActive
          ? () =>
              onFiltersChange({
                district: "",
                workMode: "",
                employmentType: "",
              })
          : undefined
      }
    >
      <Select
        value={filters.district === "" ? "all" : filters.district}
        onValueChange={(v) =>
          onFiltersChange((f) => ({ ...f, district: v === "all" ? "" : v }))
        }
      >
        <SelectTrigger aria-label="District">
          <SelectValue placeholder="All districts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All districts</SelectItem>
          {districtOptions.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.workMode === "" ? "all" : filters.workMode}
        onValueChange={(v) =>
          onFiltersChange((f) => ({ ...f, workMode: v === "all" ? "" : v }))
        }
      >
        <SelectTrigger aria-label="Work mode">
          <SelectValue placeholder="All work modes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All work modes</SelectItem>
          <SelectItem value="ONSITE">Onsite</SelectItem>
          <SelectItem value="REMOTE">Remote</SelectItem>
          <SelectItem value="HYBRID">Hybrid</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.employmentType === "" ? "all" : filters.employmentType}
        onValueChange={(v) =>
          onFiltersChange((f) => ({
            ...f,
            employmentType: v === "all" ? "" : v,
          }))
        }
      >
        <SelectTrigger aria-label="Employment type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
