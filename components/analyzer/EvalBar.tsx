import { formatEval, winPercent } from "@/lib/analysis";
import type { PositionEval } from "@/types/chess";

export function EvalBar({ evaluation, flipped }: { evaluation: PositionEval | null; flipped: boolean }) {
  const pct = evaluation ? winPercent(evaluation.cp) : 50;
  const whiteShare = flipped ? 100 - pct : pct;
  const label = evaluation ? formatEval(evaluation).replace("+", "") : "";
  const whiteAhead = evaluation ? evaluation.cp >= 0 : true;
  // Le score s'affiche du côté du camp qui mène
  const labelAtBottom = whiteAhead !== flipped;

  return (
    <div className="relative h-full w-eval-bar overflow-hidden rounded-sm bg-eval-black">
      <div
        className={`absolute inset-x-0 bg-eval-white transition-all duration-300 ${flipped ? "top-0" : "bottom-0"}`}
        style={{ height: `${whiteShare}%` }}
      />
      <span
        className={`absolute inset-x-0 z-10 text-center font-mono text-2xs font-bold tracking-tighter ${
          labelAtBottom ? "bottom-1" : "top-1"
        } ${whiteAhead ? "text-eval-black" : "text-eval-white"}`}
      >
        {label}
      </span>
    </div>
  );
}
