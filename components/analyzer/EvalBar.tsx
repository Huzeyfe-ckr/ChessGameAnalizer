import { formatEval, winPercent } from "@/lib/analysis";
import type { PositionEval } from "@/types/chess";

export function EvalBar({ evaluation, flipped }: { evaluation: PositionEval | null; flipped: boolean }) {
  const pct = evaluation ? winPercent(evaluation.cp) : 50;
  const whiteShare = flipped ? 100 - pct : pct;
  const label = evaluation ? formatEval(evaluation).replace("+", "") : "";
  const whiteAhead = evaluation ? evaluation.cp >= 0 : true;
  const labelAtBottom = whiteAhead !== flipped;

  return (
    <div className="relative w-6 shrink-0 overflow-hidden rounded bg-[#403d39]">
      <div
        className={`absolute inset-x-0 bg-[#f0f0f0] transition-[height] duration-300 ${flipped ? "top-0" : "bottom-0"}`}
        style={{ height: `${whiteShare}%` }}
      />
      <span
        className={`absolute inset-x-0 z-10 text-center font-mono text-[9px] font-semibold tracking-tighter ${
          labelAtBottom ? "bottom-1" : "top-1"
        } ${labelAtBottom !== flipped ? "text-[#222]" : "text-[#f0f0f0]"}`}
      >
        {label}
      </span>
    </div>
  );
}
