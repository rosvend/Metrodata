import { motion } from "motion/react";
import { useId } from "react";

export interface Option<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string | number> {
  legend: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: "light" | "panel";
}

const TONES = {
  light: {
    track: "bg-soft ring-1 ring-rule",
    thumb: "bg-ink",
    on: "text-bg",
    off: "text-ink-muted",
    legend: "text-ink-faint",
  },
  panel: {
    track: "bg-white/8 ring-1 ring-white/12",
    thumb: "bg-green",
    on: "text-metro-ink",
    off: "text-panel-ink/85",
    legend: "text-panel-muted",
  },
};

// Native radios keep arrow-key navigation and screen-reader semantics for free
export function Segmented<T extends string | number>({ legend, options, value, onChange, tone = "light" }: Props<T>) {
  const name = useId();
  const t = TONES[tone];
  return (
    <fieldset className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <legend className="sr-only">{legend}</legend>
      <span aria-hidden className={`text-[13px] ${t.legend}`}>
        {legend}
      </span>
      <div className={`flex rounded-full p-0.5 ${t.track}`}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              title={o.hint}
              className="relative cursor-pointer rounded-full px-3 py-1.5 text-[14px] leading-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus)]"
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(o.value)}
              />
              {checked && (
                <motion.span
                  layoutId={`seg-${name}`}
                  className={`absolute inset-0 rounded-full ${t.thumb}`}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className={`relative whitespace-nowrap ${checked ? `font-semibold ${t.on}` : t.off}`}>
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
