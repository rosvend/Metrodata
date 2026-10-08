// Locale for all number and date formatting; set by the language provider before rendering
let locale = "en-US";

export const setFormatLocale = (next: string): void => {
  locale = next;
};

const number = (digits: number) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatInt = (n: number): string => number(0).format(n);

export const formatDecimal = (n: number, digits: number): string => number(digits).format(n);

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${formatDecimal(n / 1e6, 2)}M`;
  if (abs >= 1e3) return `${formatDecimal(n / 1e3, 1)}K`;
  return formatInt(n);
}

// Spanish typesets a non-breaking space before %
const percentSign = () => (locale.startsWith("es") ? " %" : "%");

export function formatPercent(share: number, { signed = false, digits = 1 } = {}): string {
  const text = `${formatDecimal(Math.abs(share * 100), digits)}${percentSign()}`;
  if (!signed) return share < 0 ? `−${text}` : text;
  return `${share < 0 ? "−" : "+"}${text}`;
}

export function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(new Date(`${iso}T00:00:00Z`));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.day} ${p.month} ${p.year}`;
}
