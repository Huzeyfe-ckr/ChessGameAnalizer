"use client";

import { useMemo } from "react";
import { Chess } from "chess.js";
import type { Move } from "chess.js";
import { MOVE_CLASSES, PIECE_GLYPHS } from "@/lib/constants";
import { themeVar } from "@/lib/theme";
import type { MoveResult } from "@/types/chess";

const FILES = "abcdefgh";

interface BoardProps {
  fen: string;
  lastMove: Move | null;
  lastResult: MoveResult | null;
  bestMove: string | null;
  flipped: boolean;
}

function squareCenter(square: string, flipped: boolean): [number, number] {
  let f = square.charCodeAt(0) - 97;
  let r = 8 - parseInt(square[1], 10);
  if (flipped) {
    f = 7 - f;
    r = 7 - r;
  }
  return [f * 12.5 + 6.25, r * 12.5 + 6.25];
}

/** Flèche du meilleur coup, dessinée en SVG par-dessus le plateau (repère 0-100). */
function BestMoveArrow({ move, flipped }: { move: string; flipped: boolean }) {
  const [x1, y1] = squareCenter(move.slice(0, 2), flipped);
  const [x2, y2] = squareCenter(move.slice(2, 4), flipped);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ex = x2 - Math.cos(angle) * 3.4;
  const ey = y2 - Math.sin(angle) * 3.4;
  const color = themeVar("--color-arrow");

  return (
    <svg className="pointer-events-none absolute inset-0 z-20 size-full" viewBox="0 0 100 100">
      <defs>
        <marker id="best-arrow-head" markerWidth="3" markerHeight="3" refX="1.1" refY="1.5" orient="auto">
          <path d="M0,0 L3,1.5 L0,3 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeOpacity={0.85}
        strokeWidth={2.4}
        strokeLinecap="round"
        markerEnd="url(#best-arrow-head)"
      />
    </svg>
  );
}

export function Board({ fen, lastMove, lastResult, bestMove, flipped }: BoardProps) {
  const board = useMemo(() => new Chess(fen).board(), [fen]);

  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const rr = flipped ? 7 - r : r;
      const cc = flipped ? 7 - c : c;
      const name = FILES[cc] + (8 - rr);
      const light = (rr + cc) % 2 === 0;
      const piece = board[rr][cc];
      const highlighted = lastMove && (lastMove.from === name || lastMove.to === name);
      const showBadge = lastResult && lastMove?.to === name;

      squares.push(
        <div key={name} className={`relative flex items-center justify-center ${light ? "bg-sq-light" : "bg-sq-dark"}`}>
          {highlighted && <div className="absolute inset-0 bg-sq-highlight" />}
          {piece && (
            <span className={`glyph piece-size relative z-10 ${piece.color === "w" ? "piece-white" : "piece-black"}`}>
              {PIECE_GLYPHS[piece.type]}
              {"︎"}
            </span>
          )}
          {c === 0 && (
            <span className={`coord-label absolute left-1 top-1 ${light ? "text-sq-dark" : "text-sq-light"}`}>{8 - rr}</span>
          )}
          {r === 7 && (
            <span className={`coord-label absolute bottom-1 right-1 ${light ? "text-sq-dark" : "text-sq-light"}`}>
              {FILES[cc]}
            </span>
          )}
          {showBadge && (
            <span
              className="move-badge-board absolute -right-1 -top-1 z-30 flex items-center justify-center rounded-full font-bold text-cream shadow-md"
              style={{ background: MOVE_CLASSES[lastResult.cls].color }}
            >
              {MOVE_CLASSES[lastResult.cls].symbol}
            </span>
          )}
        </div>,
      );
    }
  }

  return (
    <div className="board-container relative grid size-board select-none grid-cols-8 grid-rows-8 overflow-hidden rounded-md shadow-2xl shadow-black/50">
      {squares}
      {bestMove && <BestMoveArrow move={bestMove} flipped={flipped} />}
    </div>
  );
}
