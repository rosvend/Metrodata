interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export function Loading({ label = "Loading data" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-6 text-ink-muted">
      <span className="size-2.5 animate-pulse rounded-full bg-accent" />
      <span>{label}…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorProps) {
  return (
    <div role="alert" className="rounded-lg border border-alert/40 bg-alert/5 px-4 py-3 text-sm">
      <p className="font-semibold text-alert">This view's data didn't load.</p>
      <p className="mt-1 text-ink-muted">{message}. Run `npm run data` if the files are missing, then retry.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-bg hover:bg-accent"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-rule px-5 py-8 text-ink-muted">{children}</div>;
}
