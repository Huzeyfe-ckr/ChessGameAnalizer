import { MOVE_CLASSES } from "@/lib/constants";
import type { MoveClass } from "@/types/chess";

export function MoveBadge({ cls, className = "" }: { cls: MoveClass; className?: string }) {
  const c = MOVE_CLASSES[cls];
  return (
    <span
      title={c.label}
      className={`inline-flex items-center justify-center rounded px-1.5 text-[11px] font-bold leading-5 text-white ${className}`}
      style={{ background: c.color }}
    >
      {c.symbol}
    </span>
  );
}
