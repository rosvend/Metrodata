import { useState } from "react";
import type { AccessFilter, AccessSummary } from "../data/types";
import { formatPercent } from "../lib/format";
import { BAND_HEX } from "./colors";
import { barrioKey } from "./keys";

interface Props {
  filter: AccessFilter;
  summary: AccessSummary;
  selectedBarrio: string | null;
  onBarrio: (name: string | null) => void;
}

const FILTER_LABELS: Record<AccessFilter, string> = {
  all: "all stations",
  metro: "Metro stations",
  tranvia: "Tranvía stations",
  metrocable: "Metrocable stations",
};

export function CoveragePanel({ filter, summary, selectedBarrio, onBarrio }: Props) {
  const f = summary.filters[filter];
  const [query, setQuery] = useState("");
  const full = f.barrios.filter((b) => b.share >= summary.fully_inside_threshold);
  const shown = full.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div>
        <h2 className="text-[20px] leading-tight font-semibold">Walking time to the nearest station</h2>
        <p className="text-[13px] text-ink-muted">
          Using {FILTER_LABELS[filter]} ({f.stations}).
        </p>
      </div>
      <ul className="flex gap-3 text-[13px]" aria-label="Legend">
        {[5, 10, 15].map((m) => (
          <li key={m} className="flex items-center gap-1.5">
            <span aria-hidden className="size-3 rounded-[4px]" style={{ background: BAND_HEX[m] }} />
            {m === 5 ? "Up to 5 min" : `${m - 4}–${m} min`}
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-surface px-3 py-2 ring-1 ring-rule">
          <dt className="text-[12px] text-ink-muted">Within 15 min</dt>
          <dd className="text-[17px] font-semibold tabular-nums">{f.area_15_km2.toFixed(1)} km²</dd>
        </div>
        <div className="rounded-2xl bg-surface px-3 py-2 ring-1 ring-rule">
          <dt className="text-[12px] text-ink-muted">Of Medellín's urban area</dt>
          <dd className="text-[17px] font-semibold tabular-nums">
            {formatPercent(f.medellin_urban_share_15, { digits: 0 })}
          </dd>
        </div>
        <div className="rounded-2xl bg-surface px-3 py-2 ring-1 ring-rule">
          <dt className="text-[12px] text-ink-muted">Covered twice or more</dt>
          <dd className="text-[17px] font-semibold tabular-nums">{f.overlap_15_km2.toFixed(1)} km²</dd>
        </div>
      </dl>

      <section className="flex min-h-0 flex-1 flex-col">
        <h3 className="text-[14px] font-semibold">
          Neighbourhoods fully within 15 minutes: {full.length} of {f.barrios.length}
        </h3>
        <p className="text-[12px] text-ink-faint">
          Medellín's urban neighbourhoods only (the data has none for other municipalities). Fully means at least{" "}
          {formatPercent(summary.fully_inside_threshold, { digits: 0 })} of the area.
        </p>
        <label className="mt-2 block">
          <span className="sr-only">Filter neighbourhoods</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a neighbourhood"
            className="w-full rounded-full bg-surface px-4 py-2 text-[14px] ring-1 ring-rule placeholder:text-ink-faint"
          />
        </label>
        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
          {shown.map((b) => {
            const key = barrioKey(b.comuna, b.name);
            return (
              <li key={key}>
                <button
                  type="button"
                  aria-pressed={selectedBarrio === key}
                  onClick={() => onBarrio(selectedBarrio === key ? null : key)}
                  className={`flex w-full justify-between rounded-xl px-2 py-1 text-left text-[14px] ${
                    selectedBarrio === key ? "bg-surface ring-1 ring-ink/50" : "hover:bg-surface"
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[12px] text-ink-muted">Comuna {b.comuna}</span>
                </button>
              </li>
            );
          })}
          {shown.length === 0 && <li className="px-2 py-1 text-[14px] text-ink-muted">No match.</li>}
        </ul>
      </section>
    </div>
  );
}
