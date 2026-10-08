import { DAY_TYPES, DAY_TYPE_LABELS, YEAR_COVERAGE, YEARS } from "../lib/filters";
import { Segmented } from "../ui/Segmented";
import { useFilters } from "./useFilters";

const DAY_SHORT = { weekday: "Weekday", saturday: "Sat", sunday_holiday: "Sun & hol." } as const;

export function FilterControls() {
  const [filters, setFilters] = useFilters();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Segmented
        legend="Year"
        value={filters.year}
        onChange={(year) => setFilters({ year })}
        options={YEARS.map((y) => ({ value: y, label: String(y), hint: `${y}: data for ${YEAR_COVERAGE[y]}` }))}
      />
      <Segmented
        legend="Days"
        value={filters.dayType}
        onChange={(dayType) => setFilters({ dayType })}
        options={DAY_TYPES.map((d) => ({ value: d, label: DAY_SHORT[d], hint: DAY_TYPE_LABELS[d] }))}
      />
    </div>
  );
}
