import type { LonLat } from "../data/types";
import type { WalkResult } from "./geometry";

interface Props {
  point: LonLat;
  result: WalkResult | null;
  onClear: () => void;
}

// Answer for a clicked point, at the resolution of the precomputed contours
export function PointResult({ point, result, onClear }: Props) {
  return (
    <div role="status" className="rounded-2xl bg-panel px-4 py-3 text-panel-ink" data-surface="panel">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] leading-snug">
          {result ? (
            <>
              <span className="font-semibold">
                {result.minutes === 5 ? "Within 5 minutes" : `${result.minutes - 4}–${result.minutes} minutes`}
              </span>{" "}
              on foot to {result.name}.
            </>
          ) : (
            <span className="font-semibold">More than 15 minutes on foot from any station shown.</span>
          )}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-2 text-[13px] ring-1 ring-white/30 hover:bg-white/10"
        >
          Clear
        </button>
      </div>
      <p className="mt-1 text-[12px] text-panel-muted">
        At {point[1].toFixed(4)}, {point[0].toFixed(4)}. Answered from the precomputed 5, 10 and 15-minute contours, so
        the resolution is 5-minute steps.
      </p>
    </div>
  );
}
