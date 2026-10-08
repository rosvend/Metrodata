// Shared Observable Plot styling that follows the theme tokens
export const plotStyle = {
  color: "var(--ink-muted)",
  fontFamily: "var(--font-sans)",
  fontSize: "12px",
  background: "transparent",
  overflow: "visible",
};

export const hourTick = (h: number) => (h % 4 === 0 ? `${String(h).padStart(2, "0")}h` : "");
