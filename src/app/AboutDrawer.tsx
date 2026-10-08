import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { DataQuality } from "../data/types";
import { useJson } from "../data/useJson";
import { useT } from "../i18n/lang";
import { AboutContent } from "./AboutContent";

// Native <dialog> gives focus trapping, Escape to close and an inert background
export function AboutDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="about-title"
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-[34rem] bg-transparent p-0 text-ink backdrop:bg-[#111716]/55"
    >
      {open && <Panel onClose={onClose} />}
    </dialog>
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const quality = useJson<DataQuality>("data_quality.json");
  const t = useT();
  return (
    <motion.div
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex h-full flex-col overflow-y-auto rounded-l-card bg-surface px-6 py-7 shadow-2xl sm:px-9"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="about-title" className="text-[1.9rem] leading-tight font-bold tracking-[-0.02em]">
          {t.about.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-1.5 text-[15px] text-ink ring-1 ring-ink/70 hover:bg-soft"
        >
          {t.common.close}
        </button>
      </div>
      <p className="mt-2 mb-7 max-w-[60ch] text-[15px] leading-relaxed text-ink-muted">{t.about.intro}</p>
      <AboutContent quality={quality} />
    </motion.div>
  );
}
