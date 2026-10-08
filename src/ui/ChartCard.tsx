import { InfoTip } from "./InfoTip";

interface Props {
  title: string;
  subtitle?: string;
  info?: string;
  controls?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// Soft rounded card in the style of the official site's information panels
export function ChartCard({ title, subtitle, info, controls, className = "", children }: Props) {
  return (
    <section
      aria-label={title}
      className={`flex min-w-0 flex-col rounded-card bg-soft px-4 py-3.5 sm:px-5 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
            {title}
            {info && <InfoTip label={title.toLowerCase()} text={info} />}
          </h2>
          {subtitle && <p className="text-[13px] text-ink-muted">{subtitle}</p>}
        </div>
        {controls}
      </div>
      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </section>
  );
}
