import type { LineInfo } from "../lib/lines";

const SIZES = {
  xs: "h-5 min-w-5 text-[12px] rounded-[5px]",
  sm: "h-7 min-w-7 text-[15px] rounded-[8px]",
  md: "h-9 min-w-9 text-[18px] rounded-[10px]",
};

export function LineBadge({ info, size = "md" }: { info: LineInfo; size?: keyof typeof SIZES }) {
  const box = SIZES[size];
  return (
    <span
      className={`inline-grid place-items-center px-1.5 font-bold ${box}`}
      style={{ background: info.color, color: info.text }}
    >
      {info.badge}
    </span>
  );
}
