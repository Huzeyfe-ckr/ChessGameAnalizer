"use client";

import { useEffect, useRef } from "react";
import type { Move } from "chess.js";
import { MoveBadge } from "@/components/ui/Badge";
import type { MoveResult } from "@/types/chess";

interface MoveListProps {
  moves: Move[];
  results: (MoveResult | null)[];
  ply: number;
  startFen: string;
  onSelect: (ply: number) => void;
}

const SHOWN_BADGES = ["best", "inaccuracy", "mistake", "blunder"];

export function MoveList({ moves, results, ply, startFen, onSelect }: MoveListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // On fait défiler uniquement la liste (jamais la page) pour garder le coup affiché visible.
  useEffect(() => {
    const container = containerRef.current;
    const active = activeRef.current;
    if (!container) return;
    if (!active) {
      container.scrollTop = 0;
      return;
    }
    const top = active.offsetTop - container.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < container.scrollTop) container.scrollTop = top - 8;
    else if (bottom > container.scrollTop + container.clientHeight) {
      container.scrollTop = bottom - container.clientHeight + 8;
    }
  }, [ply]);

  const firstNumber = parseInt(startFen.split(" ")[5] ?? "1", 10);
  const rows: { num: number; white: number | null; black: number | null }[] = [];
  let i = 0;
  let num = firstNumber;
  if (moves[0]?.color === "b") {
    rows.push({ num: num++, white: null, black: 0 });
    i = 1;
  }
  for (; i < moves.length; i += 2) {
    rows.push({ num: num++, white: i, black: i + 1 < moves.length ? i + 1 : null });
  }

  const cell = (idx: number | null) => {
    if (idx === null) return <span className="px-2 py-1.5 text-muted">…</span>;
    const res = results[idx];
    const active = ply === idx + 1;
    return (
      <button
        ref={active ? activeRef : undefined}
        onClick={() => onSelect(idx + 1)}
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left font-semibold transition ${
          active ? "bg-surface-3 text-cream" : "text-ink hover:bg-surface-2"
        }`}
      >
        {res && SHOWN_BADGES.includes(res.cls) ? <MoveBadge cls={res.cls} /> : <span className="size-5 shrink-0" />}
        {moves[idx].san}
      </button>
    );
  };

  return (
    <div ref={containerRef} className="scroll-thin relative min-h-0 flex-1 overflow-y-auto px-2">
      <div className="grid grid-moves text-sm">
        {rows.map((row) => (
          <div key={row.num} className="contents">
            <span className="flex items-center px-2 font-mono text-xs text-muted">{row.num}.</span>
            {cell(row.white)}
            {row.black === null && row.white !== null ? <span /> : cell(row.black)}
          </div>
        ))}
      </div>
    </div>
  );
}
