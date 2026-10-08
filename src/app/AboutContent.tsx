import type { DataQuality } from "../data/types";
import type { Resource } from "../data/useJson";
import { useT } from "../i18n/lang";
import { formatDate, formatInt } from "../lib/format";
import { ErrorState, Loading } from "../ui/Status";

function Checks({ q }: { q: DataQuality }) {
  const t = useT();
  const missing = Object.values(q.files).flatMap((f) => f.missing_dates);
  const iso = typeof q.isochrones === "string" ? null : q.isochrones;
  return (
    <ul className="space-y-2.5 text-[15px] leading-relaxed">
      <li>{t.about.reconciled(q.reconciliation["2026_matches"], q.reconciliation.hour_sum_mismatches)}</li>
      {q.excluded_dates.map((d) => (
        <li key={d.date}>{t.about.excluded(d.date, formatInt(d.system_boardings))}</li>
      ))}
      {missing.length > 0 && <li>{t.about.missing(missing.join(", "))}</li>}
      <li>{t.about.closures}</li>
      <li>{t.about.noBaseline(q.spike_index.insufficient_baseline_days)}</li>
      {iso && (
        <li>
          {t.about.walking(
            iso.source.stations_ok,
            iso.source.stations_requested,
            formatDate(iso.source.osm.osm_data_timestamp.slice(0, 10)),
            iso.source.valhalla_version,
            iso.source.walking_speed_kmh,
          )}
        </li>
      )}
    </ul>
  );
}

export function AboutContent({ quality }: { quality: Resource<DataQuality> }) {
  const t = useT();
  return (
    <div className="space-y-7">
      <section>
        <h3 className="text-xl font-semibold tracking-[-0.01em]">{t.about.limitsTitle}</h3>
        <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-muted">
          {t.about.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xl font-semibold tracking-[-0.01em]">{t.about.checksTitle}</h3>
        <div className="mt-3 text-ink-muted">
          {quality.status === "loading" && <Loading label={t.about.loadingChecks} />}
          {quality.status === "error" && <ErrorState message={quality.error} onRetry={quality.retry} />}
          {quality.status === "ready" && <Checks q={quality.data} />}
        </div>
      </section>
    </div>
  );
}
