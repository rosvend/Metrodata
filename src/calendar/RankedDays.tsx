import type { SpikesJson } from "../data/types";
import { formatDate } from "../lib/format";
import { SPIKE_RANGE, signed } from "./colors";
import { useLang, useT } from "../i18n/lang";
import { DriverTag } from "./DriverTag";
import { driverText } from "./labels";
import type { RankedDay } from "./shape";

interface Props {
  ranked: { spikes: RankedDay[]; dips: RankedDay[] };
  spikes: SpikesJson;
  selected: string | null;
  onSelect: (date: string) => void;
}

function List({
  title,
  days,
  spikes,
  selected,
  onSelect,
  color,
  max,
}: Omit<Props, "ranked"> & { title: string; days: RankedDay[]; color: string; max: number }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <div>
      <h3 className="mb-1 text-[13px] font-semibold text-ink-muted">{title}</h3>
      <ol className="space-y-0.5">
        {days.map((d) => (
          <li key={d.date}>
            <button
              type="button"
              onClick={() => onSelect(d.date)}
              aria-pressed={selected === d.date}
              className={`flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-2 py-1 text-left text-[13px] sm:grid sm:grid-cols-[7.2rem_4.2rem_1fr] ${
                selected === d.date ? "bg-surface ring-1 ring-ink/50" : "hover:bg-surface/70"
              }`}
            >
              <span className="tabular-nums">{formatDate(d.date)}</span>
              <span className="flex items-center gap-1.5 font-semibold tabular-nums">
                <span
                  aria-hidden
                  className="h-2 rounded-full"
                  style={{ width: `${Math.max(4, (Math.abs(d.value) / max) * 28)}px`, background: color }}
                />
                {signed(d.value)}
              </span>
              <span className="min-w-0">
                <DriverTag label={driverText(t, spikes, d.index, lang)} none={spikes.driver[d.index] === "none"} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RankedDays({ ranked, spikes, selected, onSelect }: Props) {
  const t = useT();
  const max = Math.max(...[...ranked.spikes, ...ranked.dips].map((d) => Math.abs(d.value)), 1);
  return (
    <div className="space-y-3">
      <List
        title={t.calendar.above}
        days={ranked.spikes}
        color={SPIKE_RANGE[2] ?? ""}
        max={max}
        {...{ spikes, selected, onSelect }}
      />
      <List
        title={t.calendar.below}
        days={ranked.dips}
        color={SPIKE_RANGE[0] ?? ""}
        max={max}
        {...{ spikes, selected, onSelect }}
      />
    </div>
  );
}
