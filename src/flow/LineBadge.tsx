import type { LineInfo } from "../lib/lines";

export function LineBadge({ info, size = "md" }: { info: LineInfo; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 min-w-7 text-[15px] rounded-[8px]" : "h-9 min-w-9 text-[18px] rounded-[10px]";
  return (
    <span
      className={`inline-grid place-items-center px-1.5 font-bold ${box}`}
      style={{ background: info.color, color: info.text }}
    >
      {info.badge}
    </span>
  );
}
