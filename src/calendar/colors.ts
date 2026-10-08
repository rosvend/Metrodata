// Diverging scale for spike_index: red dips, neutral at zero, Metro blue spikes (clamped at ±40%).
// Red–blue stays distinct for protan, deutan and tritan viewers (see scripts/metro/colorcheck.py); red–green did not.
export const SPIKE_DOMAIN = [-40, 0, 40];
export const SPIKE_RANGE = ["#c2401c", "#e8eceb", "#215ca0"];

export const spikeScale = {
  type: "linear" as const,
  domain: SPIKE_DOMAIN,
  range: SPIKE_RANGE,
  clamp: true,
};

export const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
