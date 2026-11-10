"use client";

import { MOVE_CLASSES } from "@/lib/constants";
import { winPercent } from "@/lib/analysis";
import type { MoveResult, PositionEval } from "@/types/chess";

interface EvalGraphProps {
  evals: (PositionEval | null)[];
  results: (MoveResult | null)[];
  ply: number;
  onSelect: (ply: number) => void;
}

const W = 600;
const H = 90;

export function EvalGraph({ evals, results, ply, onSelect }: EvalGraphProps) {
  const n = evals.length;
  if (!n) return null;
  const x = (i: number) => (n === 1 ? 0 : (i / (n - 1)) * W);
  const y = (cp: number) => H - (winPercent(cp) / 100) * H;

  const points = evals
    .map((ev, i) => (ev ? `${x(i).toFixed(1)},${y(ev.cp).toFixed(1)}` : null))
    .filter(Boolean) as string[];
  const lastX = points.length ? points[points.length - 1].split(",")[0] : "0";

  return (
    <svg
      className="block h-24 w-full cursor-pointer rounded-md bg-[#403d39]"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSelect(Math.round(((e.clientX - rect.left) / rect.width) * (n - 1)));
      }}
    >
      {points.length > 0 && <polygon points={`0,${H} ${points.join(" ")} ${lastX},${H}`} fill="#f0f0f0" />}
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#777" strokeDasharray="3 3" />
      {results.map((r, i) =>
        r && ["inaccuracy", "mistake", "blunder"].includes(r.cls) && evals[i + 1] ? (
          <circle
            key={i}
            cx={x(i + 1)}
            cy={y(evals[i + 1]!.cp)}
            r={3.5}
            fill={MOVE_CLASSES[r.cls].color}
            stroke="#000"
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
        ) : null,
      )}
      <line x1={x(ply)} y1={0} x2={x(ply)} y2={H} stroke="#81b64c" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
