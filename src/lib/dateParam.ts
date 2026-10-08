const ISO = /^\d{4}-\d{2}-\d{2}$/;

export const parseDate = (params: URLSearchParams): string | null => {
  const d = params.get("date");
  return d && ISO.test(d) ? d : null;
};

export function withDate(params: URLSearchParams, date: string): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set("date", date);
  next.set("year", date.slice(0, 4));
  return next;
}

export const dateForYear = (date: string | null, year: number): string | null =>
  date && date.startsWith(String(year)) ? date : null;
