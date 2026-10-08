import { useState } from "react";
import type { AccessFilter, AccessSummary } from "../data/types";
import { useT } from "../i18n/lang";
import { formatDecimal, formatPercent } from "../lib/format";
import { BAND_HEX } from "./colors";
import { barrioKey } from "./keys";

interface Props {
  filter: AccessFilter;
  summary: AccessSummary;
  selectedBarrio: string | null;
  onBarrio: (key: string | null) => void;
}

export function CoveragePanel({ filter, summary, selectedBarrio, onBarrio }: Props) {
  const a = useT().access;
  const f = summary.filters[filter];
  const [query, setQuery] = useState("");
  const full = f.barrios.filter((b) => b.share >= summary.fully_inside_threshold);
  const shown = full.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()));
  const stat = (label: string, value: string) => (
    <div className="rounded-2xl bg-surface px-3 py-2 ring-1 ring-rule">
      <dt className="text-[12px] text-ink-muted">{label}</dt>
      <dd className="text-[17px] font-semibold tabular-nums">{value}</dd>
    </div>
  );
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div>
        <h2 className="text-[20px] leading-tight font-semibold">{a.coverageTitle}</h2>
        <p className="text-[13px] text-ink-muted">{a.using(a.filterNames[filter], f.stations)}</p>
      </div>
      <ul className="flex gap-3 text-[13px]" aria-label={useT().peaks.legend}>
        {[5, 10, 15].map((m) => (
          <li key={m} className="flex items-center gap-1.5">
            <span aria-hidden className="size-3 rounded-[4px]" style={{ background: BAND_HEX[m] }} />
            {a.band(m)}
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-3 gap-2">
        {stat(a.within15, `${formatDecimal(f.area_15_km2, 1)} km²`)}
        {stat(a.urbanShare, formatPercent(f.medellin_urban_share_15, { digits: 0 }))}
        {stat(a.twice, `${formatDecimal(f.overlap_15_km2, 1)} km²`)}
      </dl>

      <section className="flex min-h-0 flex-1 flex-col">
        <h3 className="text-[14px] font-semibold">{a.barriosTitle(full.length, f.barrios.length)}</h3>
        <p className="text-[12px] text-ink-faint">
          {a.barriosNote(formatPercent(summary.fully_inside_threshold, { digits: 0 }))}
        </p>
        <label className="mt-2 block">
          <span className="sr-only">{a.filterBarrios}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={a.findBarrio}
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
                  <span className="text-[12px] text-ink-muted">{a.comuna(b.comuna)}</span>
                </button>
              </li>
            );
          })}
          {shown.length === 0 && <li className="px-2 py-1 text-[14px] text-ink-muted">{a.noMatch}</li>}
        </ul>
      </section>
    </div>
  );
}
