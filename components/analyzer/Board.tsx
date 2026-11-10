"use client";

import { useMemo } from "react";
import { Chess } from "chess.js";
import type { Move } from "chess.js";
import { MOVE_CLASSES, PIECE_GLYPHS } from "@/lib/constants";
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
        <div
          key={name}
          className={`relative flex items-center justify-center ${light ? "bg-sq-light" : "bg-sq-dark"}`}
        >
          {highlighted && <div className="absolute inset-0 bg-[rgba(255,214,0,0.42)]" />}
          {piece && (
            <span
              className={`chess-glyph relative z-10 text-[min(10.5vw,52px)] leading-none lg:text-[min(4.2vw,52px)] ${
                piece.color === "w" ? "piece-white" : "piece-black"
              }`}
            >
              {PIECE_GLYPHS[piece.type]}
              {"︎"}
            </span>
          )}
          {c === 0 && (
            <span className={`absolute left-1 top-0.5 text-[10px] font-bold ${light ? "text-sq-dark" : "text-sq-light"}`}>
              {8 - rr}
            </span>
          )}
          {r === 7 && (
            <span className={`absolute bottom-0 right-1 text-[10px] font-bold ${light ? "text-sq-dark" : "text-sq-light"}`}>
              {FILES[cc]}
            </span>
          )}
          {showBadge && (
            <span
              className="absolute -right-[6%] -top-[6%] z-30 flex h-[42%] w-[42%] items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md"
              style={{ background: MOVE_CLASSES[lastResult.cls].color }}
            >
              {MOVE_CLASSES[lastResult.cls].symbol}
            </span>
          )}
        </div>,
      );
    }
  }

  let arrow = null;
  if (bestMove) {
    const [x1, y1] = squareCenter(bestMove.slice(0, 2), flipped);
    const [x2, y2] = squareCenter(bestMove.slice(2, 4), flipped);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - Math.cos(angle) * 3.2;
    const ey = y2 - Math.sin(angle) * 3.2;
    arrow = (
      <svg className="pointer-events-none absolute inset-0 z-20" viewBox="0 0 100 100">
        <defs>
          <marker id="arrow-head" markerWidth="3" markerHeight="3" refX="1.2" refY="1.5" orient="auto">
            <path d="M0,0 L3,1.5 L0,3 z" fill="#5fb0e8" />
          </marker>
        </defs>
        <line
          x1={x1}
          y1={y1}
          x2={ex}
          y2={ey}
          stroke="#5fb0e8"
          strokeOpacity={0.85}
          strokeWidth={2.2}
          strokeLinecap="round"
          markerEnd="url(#arrow-head)"
        />
      </svg>
    );
  }

  return (
    <div className="relative grid aspect-square w-full select-none grid-cols-8 grid-rows-8 overflow-hidden rounded-md shadow-2xl">
      {squares}
      {arrow}
    </div>
  );
}
