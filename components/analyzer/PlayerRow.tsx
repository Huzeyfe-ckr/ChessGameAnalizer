import type { Color } from "@/types/chess";

interface PlayerRowProps {
  name: string;
  color: Color;
  accuracy: number | null;
}

/** Bandeau d'un joueur au-dessus / en dessous de l'échiquier. */
export function PlayerRow({ name, color, accuracy }: PlayerRowProps) {
  const match = name.match(/^(.*?)\s*\((\d+)\)$/);
  const displayName = match ? match[1] : name;
  const elo = match ? match[2] : null;

  return (
    <div className="flex h-12 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`glyph flex size-9 shrink-0 items-center justify-center rounded-md text-xl ${
            color === "w" ? "bg-surface-3 piece-white" : "bg-ink-soft piece-black"
          }`}
        >
          ♚{"︎"}
        </span>
        <p className="truncate text-sm font-semibold text-cream">
          {displayName}
          {elo && <span className="ml-1.5 font-normal text-muted">({elo})</span>}
        </p>
      </div>
      {accuracy !== null && (
        <span className="shrink-0 rounded-md bg-surface-2 px-2.5 py-1 font-mono text-xs text-ink-soft">
          {accuracy.toFixed(1)} %
        </span>
      )}
    </div>
  );
}
