import { playerAccuracy } from "@/lib/analysis";
import { MOVE_CLASSES, MOVE_CLASS_ORDER } from "@/lib/constants";
import type { MoveResult } from "@/types/chess";

const short = (name: string) => name.replace(/\s*\(.*\)$/, "");

interface SummaryProps {
  results: (MoveResult | null)[];
  white: string;
  black: string;
}

export function Summary({ results, white, black }: SummaryProps) {
  const count = (color: "w" | "b", cls: string) => results.filter((r) => r?.color === color && r.cls === cls).length;
  const players = [
    { color: "w" as const, name: short(white), acc: playerAccuracy(results, "w"), chip: "bg-eval-white text-eval-black" },
    { color: "b" as const, name: short(black), acc: playerAccuracy(results, "b"), chip: "bg-eval-black text-eval-white ring-1 ring-line" },
  ];

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-5">
      <p className="text-eyebrow font-semibold uppercase tracking-label text-muted">Précision</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {players.map((p) => (
          <div key={p.color} className="rounded-xl bg-surface-2 p-4 text-center">
            <p className="truncate text-sm text-ink-soft">{p.name}</p>
            <p className={`mx-auto mt-2 w-fit rounded-lg px-3 py-1 font-display text-3xl ${p.chip}`}>
              {p.acc !== null ? p.acc.toFixed(1) : "–"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-moves gap-y-2 text-sm">
        {MOVE_CLASS_ORDER.map((cls) => (
          <div key={cls} className="contents">
            <span className="text-center font-mono text-base font-semibold" style={{ color: MOVE_CLASSES[cls].color }}>
              {count("w", cls)}
            </span>
            <span className="flex items-center justify-center gap-2 text-ink">
              <span className="size-2 rounded-full" style={{ background: MOVE_CLASSES[cls].color }} />
              {MOVE_CLASSES[cls].label}
            </span>
            <span className="text-center font-mono text-base font-semibold" style={{ color: MOVE_CLASSES[cls].color }}>
              {count("b", cls)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
