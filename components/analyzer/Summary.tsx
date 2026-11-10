import { playerAccuracy } from "@/lib/analysis";
import { MOVE_CLASSES, MOVE_CLASS_ORDER } from "@/lib/constants";
import type { MoveResult } from "@/types/chess";

const short = (name: string) => name.replace(/\s*\(.*\)$/, "").slice(0, 14);

export function Summary({ results, white, black }: { results: (MoveResult | null)[]; white: string; black: string }) {
  if (!results.some(Boolean)) return null;
  const count = (color: "w" | "b", cls: string) => results.filter((r) => r?.color === color && r.cls === cls).length;
  const aw = playerAccuracy(results, "w");
  const ab = playerAccuracy(results, "b");

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1.5 text-sm">
      <span />
      <span className="min-w-12 text-center text-xs font-semibold text-muted">{short(white)}</span>
      <span className="min-w-12 text-center text-xs font-semibold text-muted">{short(black)}</span>

      <span>Précision</span>
      <span className="text-center font-mono text-lg font-bold">{aw?.toFixed(1) ?? "–"}</span>
      <span className="text-center font-mono text-lg font-bold">{ab?.toFixed(1) ?? "–"}</span>

      {MOVE_CLASS_ORDER.map((cls) => (
        <div key={cls} className="contents">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: MOVE_CLASSES[cls].color }} />
            {MOVE_CLASSES[cls].label}
          </span>
          <span className="text-center font-mono">{count("w", cls)}</span>
          <span className="text-center font-mono">{count("b", cls)}</span>
        </div>
      ))}
    </div>
  );
}
