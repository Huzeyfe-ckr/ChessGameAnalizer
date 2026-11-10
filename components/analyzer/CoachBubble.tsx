import type { Move } from "chess.js";
import { MoveBadge } from "@/components/ui/Badge";
import { formatEval } from "@/lib/analysis";
import { MOVE_CLASSES } from "@/lib/constants";
import type { MoveResult, PositionEval } from "@/types/chess";

interface CoachBubbleProps {
  ply: number;
  move: Move | null;
  result: MoveResult | null;
  evalBefore: PositionEval | null;
  evalNow: PositionEval | null;
  running: boolean;
}

function EvalChip({ evaluation }: { evaluation: PositionEval | null }) {
  if (!evaluation) return null;
  const whiteAhead = evaluation.cp >= 0;
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-1 font-mono text-sm font-bold ${
        whiteAhead ? "bg-eval-white text-eval-black" : "bg-eval-black text-eval-white"
      }`}
    >
      {formatEval(evaluation)}
    </span>
  );
}

/** Bulle de commentaire du coup affiché, sur le modèle du « Bilan » de chess.com. */
export function CoachBubble({ ply, move, result, evalBefore, evalNow, running }: CoachBubbleProps) {
  let content;

  if (ply === 0 || !move) {
    content = (
      <>
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-cream">Position de départ</p>
          <EvalChip evaluation={evalNow} />
        </div>
        {evalNow?.bestSan && (
          <p className="mt-2 text-sm text-ink-soft">
            Coup conseillé : <b className="text-gold">{evalNow.bestSan}</b>
          </p>
        )}
      </>
    );
  } else if (!result) {
    content = (
      <p className="text-sm text-ink-soft">{running ? "Analyse de ce coup en cours…" : "Ce coup n’a pas été analysé."}</p>
    );
  } else {
    const c = MOVE_CLASSES[result.cls];
    const showBest = evalBefore?.bestSan && result.cls !== "best" && result.cls !== "forced";
    content = (
      <>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-semibold text-cream">
            <MoveBadge cls={result.cls} />
            <span>
              {move.san} <span style={{ color: c.color }}>{c.phrase}</span>
            </span>
          </p>
          <EvalChip evaluation={evalNow} />
        </div>
        {showBest && (
          <p className="mt-3 text-sm text-ink-soft">
            Le meilleur coup était <b className="text-gold">{evalBefore!.bestSan}</b>
            <span className="font-mono text-muted"> ({formatEval(evalBefore)})</span>
            {evalBefore!.pvSan.length > 1 && (
              <span className="mt-1 block font-mono text-xs text-muted">{evalBefore!.pvSan.join(" ")}</span>
            )}
          </p>
        )}
        {result.delta >= 2 && (
          <p className="mt-2 text-xs text-muted">Chances de gain perdues : {result.delta.toFixed(1)} %</p>
        )}
      </>
    );
  }

  return (
    <div className="flex gap-3">
      <span className="glyph flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-3 text-2xl text-gold">
        ♞{"︎"}
      </span>
      <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm bg-cream/5 p-4 ring-1 ring-line">{content}</div>
    </div>
  );
}
