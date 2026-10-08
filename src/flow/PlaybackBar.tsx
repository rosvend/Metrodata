import { Segmented } from "../ui/Segmented";
import { METRIC_LABELS, type Metric, hourBand } from "./metrics";
import { SPEEDS, type Speed } from "./playback";
import type { Playback } from "./usePlayback";

interface Props {
  playback: Playback;
  metric: Metric;
  onMetric: (m: Metric) => void;
  showFeeders: boolean;
  onFeeders: (on: boolean) => void;
}

const TICKS = [4, 8, 12, 16, 20, 23];

export function PlaybackBar({ playback, metric, onMetric, showFeeders, onFeeders }: Props) {
  const { t, playing, speed, setT, setPlaying, setSpeed } = playback;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause the day" : "Play the day"}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-green text-metro-ink hover:brightness-95"
        >
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
            {playing ? <path d="M5 3h3.5v14H5zM11.5 3H15v14h-3.5z" /> : <path d="M6 3.5v13l11-6.5z" />}
          </svg>
        </button>
        <div aria-live="polite" className="min-w-[8.5rem]">
          <div className="text-[12px] text-panel-muted">Hour of operation</div>
          <div className="text-[22px] leading-tight font-semibold text-panel-ink">{hourBand(t)}</div>
        </div>
      </div>

      <label className="flex min-w-[220px] flex-1 flex-col gap-1">
        <span className="sr-only">Hour of day</span>
        <input
          type="range"
          min={4}
          max={23.99}
          step={0.01}
          value={t}
          aria-valuetext={hourBand(t)}
          onChange={(e) => setT(Number(e.target.value))}
          className="w-full accent-[var(--metro-green)]"
        />
        <span aria-hidden className="flex justify-between text-[11px] text-panel-muted">
          {TICKS.map((h) => (
            <span key={h}>{String(h).padStart(2, "0")}:00</span>
          ))}
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Segmented<Speed>
          tone="panel"
          legend="Speed"
          value={speed}
          onChange={setSpeed}
          options={SPEEDS.map((s) => ({ value: s, label: `${s}×` }))}
        />
        <Segmented<Metric>
          tone="panel"
          legend="Width shows"
          value={metric}
          onChange={onMetric}
          options={(Object.keys(METRIC_LABELS) as Metric[]).map((m) => ({ value: m, label: METRIC_LABELS[m] }))}
        />
        <label className="flex cursor-pointer items-center gap-2 text-[14px] text-panel-ink">
          <input
            type="checkbox"
            checked={showFeeders}
            onChange={(e) => onFeeders(e.target.checked)}
            className="size-4 accent-[var(--metro-green)]"
          />
          Feeder bus routes
        </label>
      </div>
    </div>
  );
}
