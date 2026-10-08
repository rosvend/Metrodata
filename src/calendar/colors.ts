// Diverging scale for spike_index: coral dips, neutral at zero, Metro green spikes (clamped at ±40%)
export const SPIKE_DOMAIN = [-40, 0, 40];
export const SPIKE_RANGE = ["#c2401c", "#e8eceb", "#2f7a22"];

export const spikeScale = {
  type: "linear" as const,
  domain: SPIKE_DOMAIN,
  range: SPIKE_RANGE,
  clamp: true,
};

export const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
