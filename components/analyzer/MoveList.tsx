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
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [ply]);

  if (!moves.length) {
    return <p className="text-sm text-muted">Les coups apparaîtront ici.</p>;
  }

  const firstNumber = parseInt(startFen.split(" ")[5] ?? "1", 10);
  const startsWithBlack = moves[0].color === "b";
  const rows: { num: number; white: number | null; black: number | null }[] = [];
  let i = 0;
  let num = firstNumber;
  if (startsWithBlack) {
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
        className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-left font-medium transition-colors ${
          active ? "bg-[#3d4a2e]" : "hover:bg-surface-2"
        }`}
      >
        {moves[idx].san}
        {res && SHOWN_BADGES.includes(res.cls) && <MoveBadge cls={res.cls} />}
      </button>
    );
  };

  return (
    <div className="grid max-h-80 grid-cols-[38px_1fr_1fr] overflow-y-auto text-sm">
      {rows.map((row) => (
        <div key={row.num} className="contents">
          <span className="flex items-center px-1 font-mono text-xs text-muted">{row.num}.</span>
          {cell(row.white)}
          {row.black === null && row.white !== null ? <span /> : cell(row.black)}
        </div>
      ))}
    </div>
  );
}
