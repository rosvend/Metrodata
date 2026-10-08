import { useT } from "../i18n/lang";

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export function Loading({ label }: { label?: string }) {
  const t = useT();
  return (
    <div role="status" className="flex items-center gap-3 py-6 text-ink-muted">
      <span className="size-2.5 animate-pulse rounded-full bg-accent" />
      <span>{label ?? t.common.loading}…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorProps) {
  const t = useT();
  return (
    <div role="alert" className="rounded-2xl border border-alert/40 bg-alert/5 px-4 py-3 text-sm">
      <p className="font-semibold text-alert">{t.common.loadError}</p>
      <p className="mt-1 text-ink-muted">{t.common.loadErrorHint(message)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full bg-green px-4 py-1.5 text-[14px] font-semibold text-metro-ink hover:brightness-95"
        >
          {t.common.retry}
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card bg-soft px-6 py-8 text-ink-muted">{children}</div>;
}
