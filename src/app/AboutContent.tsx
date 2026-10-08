import type { DataQuality } from "../data/types";
import type { Resource } from "../data/useJson";
import { formatInt } from "../lib/format";
import { ErrorState, Loading } from "../ui/Status";

const LIMITS = [
  "Ridership is counted per line, per day and per hour. There is no station-level or origin–destination data, so the maps show line-level volumes only.",
  "Figures are boardings, not passengers: someone who transfers is counted once on each line they board.",
  "Bottleneck measures (peak concentration, load per km, saturation index) are proxies. The data has no onboard load, capacity or headways.",
  "Reasons given for spikes and dips (Christmas lights, Feria de las Flores, long weekends, elections) are hypotheses, not proven causes.",
  "Data covers January 2024 to July 2026, but October–December 2025 does not exist. Year-over-year comparisons therefore use January–July only.",
  "Lines 1, 2 and O are bus corridors; their lengths, and per-km figures, are indicative. The Línea O shape is the planned Corredor de la 80.",
];

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function Checks({ q }: { q: DataQuality }) {
  const missing = Object.values(q.files).flatMap((f) => f.missing_dates);
  const iso = typeof q.isochrones === "string" ? null : q.isochrones;
  return (
    <ul className="space-y-2.5 text-[15px] leading-relaxed">
      <li>
        {q.reconciliation["2026_matches"]
          ? "2026 totals match the source file's grand total"
          : "2026 totals do NOT match the source"}
        ; every row's hours add up to its daily total ({q.reconciliation.hour_sum_mismatches} mismatches).
      </li>
      {q.excluded_dates.map((d) => (
        <li key={d.date}>
          {d.date} is excluded from all measures: only {formatInt(d.system_boardings)} boardings were recorded (
          {d.reason}).
        </li>
      ))}
      {missing.length > 0 && <li>Missing from the source and not filled in: {missing.join(", ")}.</li>}
      <li>Days a line did not run are treated as closures, never as zero boardings.</li>
      <li>
        {q.spike_index.insufficient_baseline_days} days have too few comparable days to compute a spike index and are
        left blank.
      </li>
      {iso && (
        <li>
          Walking areas: {iso.source.stations_ok} of {iso.source.stations_requested} stations, OpenStreetMap data from{" "}
          {longDate(iso.source.osm.osm_data_timestamp)}, Valhalla {iso.source.valhalla_version} at{" "}
          {iso.source.walking_speed_kmh} km/h.
        </li>
      )}
    </ul>
  );
}

export function AboutContent({ quality }: { quality: Resource<DataQuality> }) {
  return (
    <div className="space-y-7">
      <section>
        <h3 className="font-serif text-xl font-bold">What you can and can't read here</h3>
        <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-muted">
          {LIMITS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-serif text-xl font-bold">Data checks</h3>
        <div className="mt-3 text-ink-muted">
          {quality.status === "loading" && <Loading label="Loading data checks" />}
          {quality.status === "error" && <ErrorState message={quality.error} onRetry={quality.retry} />}
          {quality.status === "ready" && <Checks q={quality.data} />}
        </div>
      </section>
    </div>
  );
}
