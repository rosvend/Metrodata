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
}

// Native radios keep arrow-key navigation and screen-reader semantics for free
export function Segmented<T extends string | number>({ legend, options, value, onChange }: Props<T>) {
  const name = useId();
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{legend}</legend>
      <span aria-hidden className="text-[12px] text-bar-muted">
        {legend}
      </span>
      <div className="flex rounded-full bg-white/8 p-0.5 ring-1 ring-white/12">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              title={o.hint}
              className="relative cursor-pointer rounded-full px-2.5 py-1 text-[13px] leading-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus)]"
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
                  className="absolute inset-0 rounded-full bg-bar-ink"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className={`relative ${checked ? "font-semibold text-bar" : "text-bar-ink/85"}`}>{o.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
