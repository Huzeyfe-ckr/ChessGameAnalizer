import { MOVE_CLASSES } from "@/lib/constants";
import type { MoveClass } from "@/types/chess";

/** Pastille ronde de classification, comme sur chess.com. */
export function MoveBadge({ cls, className = "" }: { cls: MoveClass; className?: string }) {
  const c = MOVE_CLASSES[cls];
  return (
    <span
      title={c.label}
      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-2xs font-bold text-cream shadow-sm ${className}`}
      style={{ background: c.color }}
    >
      {c.symbol}
    </span>
  );
}
