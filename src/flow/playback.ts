export const FIRST_HOUR = 4;
export const END_HOUR = 24;
export const SECONDS_PER_HOUR = 2.5;
export const SPEEDS = [0.5, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];

// Advance a continuous hour-of-day, looping over the operating day (04:00 to 24:00)
export function advance(t: number, dtMs: number, speed: number): number {
  const next = t + (dtMs / 1000 / SECONDS_PER_HOUR) * speed;
  const span = END_HOUR - FIRST_HOUR;
  return next >= END_HOUR ? FIRST_HOUR + ((next - FIRST_HOUR) % span) : next;
}
