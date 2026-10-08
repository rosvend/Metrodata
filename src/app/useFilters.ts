import { useSearchParams } from "react-router";
import { type Filters, parseFilters, withFilters } from "../lib/filters";

export function useFilters(): [Filters, (patch: Partial<Filters>) => void] {
  const [params, setParams] = useSearchParams();
  const set = (patch: Partial<Filters>) => setParams((p) => withFilters(p, patch), { replace: true });
  return [parseFilters(params), set];
}
