import type { AccessSummary, IsochroneStats, IsochronesGeo, StationsGeo } from "../data/types";
import { LineBadge } from "../flow/LineBadge";
import { useT } from "../i18n/lang";
import { formatDecimal, formatInt, formatPercent } from "../lib/format";
import { MODE_LABELS, type Mode, lineInfo } from "../lib/lines";
import { BAND_HEX } from "./colors";

type StationFeature = StationsGeo["features"][number];

interface Props {
  station: StationFeature;
  iso: IsochronesGeo;
  stats: IsochroneStats["stations"][number] | undefined;
  nearest: AccessSummary["nearest"][string];
  names: Map<string, string>;
  onStation: (id: string) => void;
}

// Below this, two 15-minute areas share only a sliver of street
const SLIGHT_KM2 = 0.05;

const distance = (meters: number) =>
  meters >= 1000 ? `${formatDecimal(meters / 1000, 1)} km` : `${formatInt(meters)} m`;

export function StationPanel({ station, iso, stats, nearest, names, onStation }: Props) {
  const a = useT().access;
  const p = station.properties;
  const areas = iso.features
    .filter((f) => f.properties.station_id === p.id)
    .sort((x, y) => x.properties.minutes - y.properties.minutes);
  const overlapKm2 = new Map(stats?.neighbours.map((n) => [n.station_id, n.overlap_km2]));
  const overlapNote = (id: string) => {
    const km2 = overlapKm2.get(id);
    if (km2 === undefined) return "";
    return km2 < SLIGHT_KM2 ? a.touch : a.overlap;
  };
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[22px] leading-tight font-semibold tracking-[-0.01em]">{p.name}</h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {p.lines.map((l) => (
            <LineBadge key={l} info={lineInfo(l)} size="sm" />
          ))}
          <span className="ml-1 text-[13px] text-ink-muted">
            {p.modes.map((m) => MODE_LABELS[m as Mode]).join(", ")}
          </span>
        </div>
      </div>

      <section>
        <h3 className="text-[14px] font-semibold">{a.reachable}</h3>
        <dl className="mt-1.5 grid grid-cols-3 gap-2">
          {areas.map((f) => (
            <div key={f.properties.minutes} className="rounded-2xl bg-surface px-3 py-2 ring-1 ring-rule">
              <dt className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: BAND_HEX[f.properties.minutes] }}
                />
                {a.min(f.properties.minutes)}
              </dt>
              <dd className="text-[18px] font-semibold tabular-nums">{formatDecimal(f.properties.area_km2, 2)} km²</dd>
            </div>
          ))}
        </dl>
        {stats && (
          <p className="mt-2 text-[13px] text-ink-muted">
            {a.overlapShare(
              stats.overlap_share > 0 && stats.overlap_share < 0.01
                ? a.underOne
                : formatPercent(stats.overlap_share, { digits: 0 }),
            )}
          </p>
        )}
      </section>

      <section>
        <h3 className="text-[14px] font-semibold">{a.nearest}</h3>
        <ul className="mt-1 space-y-0.5">
          {nearest.map((n) => (
            <li key={n.station_id}>
              <button
                type="button"
                onClick={() => onStation(n.station_id)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-left text-[14px] hover:bg-surface"
              >
                <span>{names.get(n.station_id) ?? n.station_id}</span>
                <span className="text-[13px] text-ink-muted tabular-nums">
                  {a.straightLine(distance(n.distance_m))}
                  {overlapNote(n.station_id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {stats && <p className="text-[12px] text-ink-faint">{a.snapNote(formatInt(stats.snap_m))}</p>}
    </div>
  );
}
