// "Likely driver" chip; the wording keeps it explicit that this is a hypothesis
export function DriverTag({ label }: { label: string }) {
  if (label === "No obvious driver") return <span className="text-[12px] text-ink-faint">{label}</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[12px] whitespace-nowrap text-ink ring-1 ring-rule">
      {label}
      <span className="text-ink-faint">(hypothesis)</span>
    </span>
  );
}
