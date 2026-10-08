const intFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const formatInt = (n: number): string => intFmt.format(n);

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return formatInt(n);
}

export function formatPercent(share: number, { signed = false, digits = 1 } = {}): string {
  const text = `${Math.abs(share * 100).toFixed(digits)}%`;
  if (!signed) return share < 0 ? `−${text}` : text;
  return `${share < 0 ? "−" : "+"}${text}`;
}
