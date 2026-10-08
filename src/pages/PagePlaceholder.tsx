import { useFilters } from "../app/useFilters";
import { DAY_TYPE_LABELS, YEAR_COVERAGE } from "../lib/filters";
import type { PageDef } from "../app/pages";
import { Empty } from "../ui/Status";
import { PageContainer } from "../ui/PageContainer";
import { PageHeader } from "../ui/PageHeader";

// Temporary body for pages built in later phases; shows the active global filters
export function PagePlaceholder({ page, phase }: { page: PageDef; phase: number }) {
  const [filters] = useFilters();
  return (
    <PageContainer>
      <PageHeader title={page.title} lede={page.lede} />
      <Empty>
        This view arrives in phase {phase}. Current selection: {filters.year} ({YEAR_COVERAGE[filters.year]}),{" "}
        {DAY_TYPE_LABELS[filters.dayType].toLowerCase()}.
      </Empty>
    </PageContainer>
  );
}
