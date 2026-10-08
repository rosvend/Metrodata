import { AnimatePresence, motion } from "motion/react";
import { useDemo } from "./useDemo";

const BUTTON = "rounded-full px-4 py-1.5 text-[14px] ring-1 ring-white/25 hover:bg-white/10 disabled:opacity-40";
const PRIMARY = "rounded-full bg-green px-5 py-1.5 text-[14px] font-semibold text-metro-ink hover:brightness-95";

// Narration strip for the guided tour, docked under the top bar so it never hides the content it describes
export function DemoBar() {
  const { steps, index, error, go, stop } = useDemo();
  const step = index === null ? undefined : steps[index];
  const last = index !== null && index === steps.length - 1;
  return (
    <AnimatePresence>
      {(step || error) && (
        <motion.section
          key="demo"
          aria-label="Guided demo"
          data-surface="panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden bg-panel text-panel-ink"
        >
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-8">
            {error && (
              <p role="alert" className="text-[15px]">
                The demo could not start: {error}.
              </p>
            )}
            {step && index !== null && (
              <>
                <div className="shrink-0">
                  <p className="text-[12px] text-panel-muted">
                    Step {index + 1} of {steps.length}
                  </p>
                  <ol aria-hidden className="mt-1 flex gap-1">
                    {steps.map((s, i) => (
                      <li
                        key={`${s.url}-${i}`}
                        className={`h-1.5 w-4 rounded-full ${i <= index ? "bg-green" : "bg-white/15"}`}
                      />
                    ))}
                  </ol>
                </div>
                <motion.div
                  key={index}
                  aria-live="polite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="min-w-[280px] flex-1"
                >
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{step.title}</h2>
                  <p className="text-[15px] leading-snug font-light">{step.caption}</p>
                </motion.div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex gap-2">
                    <button type="button" onClick={stop} className={BUTTON}>
                      End demo
                    </button>
                    <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={BUTTON}>
                      Back
                    </button>
                    <button type="button" onClick={last ? stop : () => go(index + 1)} className={PRIMARY}>
                      {last ? "Finish" : "Next"}
                    </button>
                  </div>
                  <p className="text-[11px] text-panel-muted">← and → to move, Esc to leave</p>
                </div>
              </>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
