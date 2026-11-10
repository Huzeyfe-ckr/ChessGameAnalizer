import type { Move } from "chess.js";
import { formatEval } from "@/lib/analysis";
import { MOVE_CLASSES } from "@/lib/constants";
import type { MoveResult, PositionEval } from "@/types/chess";

interface MoveDetailsProps {
  ply: number;
  move: Move | null;
  fenBefore: string | null;
  result: MoveResult | null;
  evalBefore: PositionEval | null;
  evalNow: PositionEval | null;
}

export function MoveDetails({ ply, move, fenBefore, result, evalBefore, evalNow }: MoveDetailsProps) {
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {ply === 0 || !move ? (
        <p>
          Position de départ — éval <span className="font-mono">{formatEval(evalNow)}</span>
        </p>
      ) : (
        <>
          <p>
            <b>
              {fenBefore?.split(" ")[5]}
              {move.color === "w" ? "." : "…"} {move.san}
            </b>
            {result && (
              <>
                {" — "}
                <b style={{ color: MOVE_CLASSES[result.cls].color }}>{MOVE_CLASSES[result.cls].label}</b>
              </>
            )}
          </p>
          <p>
            Éval après le coup : <span className="font-mono">{formatEval(evalNow)}</span>
          </p>
          {result && evalBefore?.bestSan && result.cls !== "best" && result.cls !== "forced" && (
            <>
              <p>
                Meilleur coup : <b className="text-[#5fb0e8]">{evalBefore.bestSan}</b>{" "}
                <span className="font-mono text-muted">({formatEval(evalBefore)})</span>
              </p>
              {evalBefore.pvSan.length > 0 && <p className="text-xs text-muted">Ligne : {evalBefore.pvSan.join(" ")}</p>}
            </>
          )}
          {result && <p className="text-xs text-muted">Perte de chances de gain : {result.delta.toFixed(1)} %</p>}
        </>
      )}
      {evalNow?.bestSan && (
        <p className="pt-1.5">
          Suite conseillée ici : <b className="text-[#5fb0e8]">{evalNow.bestSan}</b>
          {evalNow.pvSan.length > 1 && <span className="text-xs text-muted"> puis {evalNow.pvSan.slice(1).join(" ")}</span>}
        </p>
      )}
    </div>
  );
}
