import { useId, useState } from "react";

// Small "i" button that reveals a definition on hover, focus or tap
export function InfoTip({ label, text }: { label: string; text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`What is ${label}?`}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="grid size-[18px] place-items-center rounded-full text-[11px] font-semibold text-ink-muted ring-1 ring-ink-faint/60 hover:text-ink"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute top-6 right-0 z-30 w-64 rounded-2xl bg-panel px-3.5 py-3 text-[13px] leading-snug font-light text-panel-ink shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
