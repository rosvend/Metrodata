import { type Coord, type MeasuredPath, pointAlong } from "./path";

export interface ParticleLine {
  id: string;
  parts: MeasuredPath[];
}

export interface Particle {
  id: string;
  position: Coord;
}

// Map units (degrees) travelled per second, the same on every line
const SPEED = 0.0035;

// Evenly spaced particles per part, alternating direction like trains running both ways
export function placeParticles(lines: ParticleLine[], counts: Record<string, number>, elapsedSec: number): Particle[] {
  const out: Particle[] = [];
  for (const line of lines) {
    const count = counts[line.id] ?? 0;
    if (count <= 0) continue;
    const total = line.parts.reduce((s, p) => s + p.total, 0);
    for (const part of line.parts) {
      const n = Math.round((count * part.total) / total);
      const shift = (elapsedSec * SPEED) / part.total;
      for (let j = 0; j < n; j++) {
        const f = (j / n + shift) % 1;
        out.push({ id: line.id, position: pointAlong(part, j % 2 ? 1 - f : f) });
      }
    }
  }
  return out;
}
