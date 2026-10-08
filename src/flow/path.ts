export type Coord = [number, number];

export interface MeasuredPath {
  coords: Coord[];
  cum: number[];
  total: number;
}

// Planar distance with longitude scaled by latitude; accurate enough for placing particles
function dist(a: Coord, b: Coord): number {
  const k = Math.cos(((a[1] + b[1]) / 2) * (Math.PI / 180));
  return Math.hypot((b[0] - a[0]) * k, b[1] - a[1]);
}

export function measure(coords: Coord[]): MeasuredPath {
  const cum = [0];
  for (let i = 1; i < coords.length; i++)
    cum.push((cum[i - 1] ?? 0) + dist(coords[i - 1] as Coord, coords[i] as Coord));
  return { coords, cum, total: cum[cum.length - 1] ?? 0 };
}

export function pointAlong(p: MeasuredPath, f: number): Coord {
  const target = Math.min(Math.max(f, 0), 1) * p.total;
  let lo = 0;
  let hi = p.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((p.cum[mid] ?? 0) <= target) lo = mid;
    else hi = mid;
  }
  const a = p.coords[lo] as Coord;
  const b = p.coords[hi] as Coord;
  const span = (p.cum[hi] ?? 0) - (p.cum[lo] ?? 0);
  const u = span > 0 ? (target - (p.cum[lo] ?? 0)) / span : 0;
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}
