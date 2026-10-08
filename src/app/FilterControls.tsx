import { useT } from "../i18n/lang";
import { DAY_TYPES, YEARS } from "../lib/filters";
import { Segmented } from "../ui/Segmented";
import { useFilters } from "./useFilters";

export function FilterControls() {
  const [filters, setFilters] = useFilters();
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Segmented
        legend={t.filters.year}
        value={filters.year}
        onChange={(year) => setFilters({ year })}
        options={YEARS.map((y) => ({ value: y, label: String(y), hint: t.filters.yearHint(y, t.filters.coverage[y]) }))}
      />
      <Segmented
        legend={t.filters.days}
        value={filters.dayType}
        onChange={(dayType) => setFilters({ dayType })}
        options={DAY_TYPES.map((d) => ({ value: d, label: t.filters.dayShort[d], hint: t.filters.dayPlural[d] }))}
      />
    </div>
  );
}
