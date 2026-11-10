import { Chess } from "chess.js";
import type { Move } from "chess.js";
import { MATE_SCORE } from "@/lib/constants";
import type { Color, MoveClass, MoveResult, PositionEval } from "@/types/chess";

export function mateToCp(mate: number): number {
  return mate > 0 ? MATE_SCORE - mate : -MATE_SCORE - mate;
}

/** Probabilité de gain des Blancs (0-100), formule utilisée par Lichess. */
export function winPercent(cp: number): number {
  const c = Math.max(-1000, Math.min(1000, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
}

export function accuracyFromDelta(delta: number): number {
  return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * delta) - 3.1669));
}

export function formatEval(ev: PositionEval | null | undefined): string {
  if (!ev) return "…";
  if (ev.mate !== null) {
    if (ev.mate === 0) return ev.cp > 0 ? "1-0" : "0-1";
    return `${ev.mate > 0 ? "+" : "-"}M${Math.abs(ev.mate)}`;
  }
  const v = ev.cp / 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}`;
}

function playUci(game: Chess, uci: string): Move | null {
  try {
    return game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? "q" });
  } catch {
    return null;
  }
}

export function uciToSan(fen: string, uci: string | null): string | null {
  if (!uci) return null;
  const mv = playUci(new Chess(fen), uci);
  return mv ? mv.san : uci;
}

export function pvToSan(fen: string, pv: string[], max = 6): string[] {
  const game = new Chess(fen);
  const out: string[] = [];
  for (const uci of pv.slice(0, max)) {
    const mv = playUci(game, uci);
    if (!mv) break;
    out.push(mv.san);
  }
  return out;
}

/** Positions terminales (mat, pat, nulle) : pas besoin du moteur. */
export function terminalEval(fen: string): PositionEval | null {
  const game = new Chess(fen);
  const base = { best: null, bestSan: null, pv: [], pvSan: [] };
  if (game.isCheckmate()) {
    return { ...base, cp: game.turn() === "w" ? -MATE_SCORE : MATE_SCORE, mate: 0 };
  }
  if (game.isDraw() || game.isStalemate()) return { ...base, cp: 0, mate: null };
  return null;
}

export function classifyMove(
  move: Move,
  fenBefore: string,
  before: PositionEval,
  after: PositionEval,
): MoveResult {
  const isWhite = move.color === "w";
  const wb = winPercent(before.cp);
  const wa = winPercent(after.cp);
  const moverBefore = isWhite ? wb : 100 - wb;
  const moverAfter = isWhite ? wa : 100 - wa;
  const delta = Math.max(0, moverBefore - moverAfter);
  const uci = move.from + move.to + (move.promotion ?? "");
  const legalMoves = new Chess(fenBefore).moves().length;

  let cls: MoveClass;
  if (legalMoves === 1) cls = "forced";
  else if (before.best === uci || after.mate === 0) cls = "best";
  else if (delta < 2) cls = "excellent";
  else if (delta < 5) cls = "good";
  else if (delta < 10) cls = "inaccuracy";
  else if (delta < 20) cls = "mistake";
  else cls = "blunder";

  return { cls, delta, accuracy: accuracyFromDelta(delta), color: move.color as Color };
}

export function playerAccuracy(results: (MoveResult | null)[], color: Color): number | null {
  const own = results.filter((r): r is MoveResult => r !== null && r.color === color);
  if (!own.length) return null;
  return own.reduce((sum, r) => sum + r.accuracy, 0) / own.length;
}
