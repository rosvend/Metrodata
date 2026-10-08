import { useId, useState } from "react";

// Small "i" button that reveals a definition on hover, focus or tap
interface Props {
  label: string;
  text: string;
  tone?: "light" | "panel";
  placement?: "below" | "above";
}

export function InfoTip({ label, text, tone = "light", placement = "below" }: Props) {
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
        className={`grid size-[18px] place-items-center rounded-full text-[11px] font-semibold ring-1 ${
          tone === "panel"
            ? "text-panel-muted ring-panel-muted/60 hover:text-panel-ink"
            : "text-ink-muted ring-ink-faint/60 hover:text-ink"
        }`}
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute right-0 z-30 w-72 rounded-2xl px-3.5 py-3 text-[13px] leading-snug font-light shadow-xl ${
            placement === "above" ? "bottom-6" : "top-6"
          } ${tone === "panel" ? "bg-surface text-ink ring-1 ring-rule" : "bg-panel text-panel-ink"}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
