import type { LonLat } from "../data/types";
import { useT } from "../i18n/lang";
import { formatDecimal } from "../lib/format";
import type { WalkResult } from "./geometry";

interface Props {
  point: LonLat;
  result: WalkResult | null;
  onClear: () => void;
}

// Answer for a clicked point, at the resolution of the precomputed contours
export function PointResult({ point, result, onClear }: Props) {
  const a = useT().access;
  return (
    <div role="status" className="rounded-2xl bg-panel px-4 py-3 text-panel-ink" data-surface="panel">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] leading-snug">
          {result ? (
            <>
              <span className="font-semibold">{result.minutes === 5 ? a.within5 : a.minutesRange(result.minutes)}</span>{" "}
              {a.onFootTo(result.name)}
            </>
          ) : (
            <span className="font-semibold">{a.beyond}</span>
          )}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-2 text-[13px] ring-1 ring-white/30 hover:bg-white/10"
        >
          {a.clear}
        </button>
      </div>
      <p className="mt-1 text-[12px] text-panel-muted">
        {a.pointNote(formatDecimal(point[1], 4), formatDecimal(point[0], 4))}
      </p>
    </div>
  );
}
