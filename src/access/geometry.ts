import type { AreaGeometry, IsochronesGeo, LonLat } from "../data/types";

// Ray casting on one ring
function inRing([x, y]: LonLat, ring: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as LonLat;
    const [xj, yj] = ring[j] as LonLat;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const inPolygon = (p: LonLat, rings: LonLat[][]) =>
  rings.length > 0 && inRing(p, rings[0] ?? []) && !rings.slice(1).some((hole) => inRing(p, hole));

export function pointInGeometry(p: LonLat, g: AreaGeometry): boolean {
  return g.type === "Polygon" ? inPolygon(p, g.coordinates) : g.coordinates.some((poly) => inPolygon(p, poly));
}

export interface WalkResult {
  minutes: number;
  station_id: string;
  name: string;
}

// Smallest precomputed contour containing the point (contour resolution: 5-minute steps)
export function walkingTime(p: LonLat, iso: IsochronesGeo, only?: Set<string>): WalkResult | null {
  let best: WalkResult | null = null;
  for (const f of iso.features) {
    const { station_id, name, minutes } = f.properties;
    if (only && !only.has(station_id)) continue;
    if ((best === null || minutes < best.minutes) && pointInGeometry(p, f.geometry))
      best = { minutes, station_id, name };
  }
  return best;
}

const scaleRing = (ring: LonLat[], [ox, oy]: LonLat, k: number): LonLat[] =>
  ring.map(([x, y]) => [ox + (x - ox) * k, oy + (y - oy) * k]);

// Used to grow a contour out of its station when it is selected
export function scaleAround(g: AreaGeometry, origin: LonLat, k: number): AreaGeometry {
  return g.type === "Polygon"
    ? { type: "Polygon", coordinates: g.coordinates.map((r) => scaleRing(r, origin, k)) }
    : { type: "MultiPolygon", coordinates: g.coordinates.map((poly) => poly.map((r) => scaleRing(r, origin, k))) };
}
