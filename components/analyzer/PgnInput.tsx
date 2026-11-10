"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DEFAULT_DEPTH, DEPTH_OPTIONS, EXAMPLE_PGN } from "@/lib/constants";

interface PgnInputProps {
  error: string;
  onAnalyse: (pgn: string, depth: number) => void;
}

const PLACEHOLDER = `[Event "Live Chess"]
[Site "Chess.com"]
...
1. e4 {[%clk 0:09:58]} 1... e5 2. Nf3 Nc6 ...

Ou juste les coups : 1. e4 e5 2. Nf3 Nc6 3. Bb5`;

export function PgnInput({ error, onAnalyse }: PgnInputProps) {
  const [pgn, setPgn] = useState("");
  const [depth, setDepth] = useState(DEFAULT_DEPTH);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
      <div>
        <h3 className="font-display text-2xl text-cream">Nouvelle analyse</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Sur chess.com : fin de partie → <b className="text-ink">Partager</b> → <b className="text-ink">PGN</b> → Copier.
        </p>
      </div>

      <textarea
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        className="scroll-thin min-h-40 w-full flex-1 resize-none rounded-xl border border-line bg-background p-4 font-mono text-xs leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-gold"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-2">
        <label htmlFor="depth" className="text-sm text-muted">
          Profondeur
        </label>
        <Select id="depth" className="flex-1" value={depth} options={DEPTH_OPTIONS} onChange={(e) => setDepth(Number(e.target.value))} />
        <Button variant="ghost" onClick={() => setPgn(EXAMPLE_PGN)}>
          Exemple
        </Button>
      </div>

      <Button variant="accent" size="lg" onClick={() => onAnalyse(pgn, depth)}>
        Analyser la partie
      </Button>
    </div>
  );
}
