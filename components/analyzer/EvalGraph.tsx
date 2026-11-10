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

// Repère interne du SVG (étiré à la taille du conteneur)
const W = 600;
const H = 100;

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
      className="block h-20 w-full cursor-pointer rounded-lg bg-graph-bg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSelect(Math.round(((e.clientX - rect.left) / rect.width) * (n - 1)));
      }}
    >
      {points.length > 0 && <polygon className="fill-eval-white" points={`0,${H} ${points.join(" ")} ${lastX},${H}`} />}
      <line className="stroke-graph-axis" x1={0} y1={H / 2} x2={W} y2={H / 2} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      <line className="stroke-move-best" x1={x(ply)} y1={0} x2={x(ply)} y2={H} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      {results.map((r, i) =>
        r && ["inaccuracy", "mistake", "blunder", "best"].includes(r.cls) && evals[i + 1] ? (
          <circle
            key={i}
            cx={x(i + 1)}
            cy={y(evals[i + 1]!.cp)}
            r={4}
            style={{ fill: MOVE_CLASSES[r.cls].color }}
            className="stroke-background"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null,
      )}
    </svg>
  );
}
