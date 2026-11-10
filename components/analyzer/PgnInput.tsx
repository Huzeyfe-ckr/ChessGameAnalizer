"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import { DEFAULT_DEPTH, DEPTH_OPTIONS, EXAMPLE_PGN } from "@/lib/constants";

interface PgnInputProps {
  running: boolean;
  progress: number;
  status: string;
  error: string;
  onAnalyse: (pgn: string, depth: number) => void;
  onStop: () => void;
}

const PLACEHOLDER = `[Event "Live Chess"]
[Site "Chess.com"]
...
1. e4 {[%clk 0:09:58]} 1... e5 2. Nf3 Nc6 ...

Ou juste les coups : 1. e4 e5 2. Nf3 Nc6 3. Bb5`;

export function PgnInput({ running, progress, status, error, onAnalyse, onStop }: PgnInputProps) {
  const [pgn, setPgn] = useState("");
  const [depth, setDepth] = useState(DEFAULT_DEPTH);

  return (
    <div>
      <textarea
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        className="min-h-32 w-full resize-y rounded-lg border border-line bg-background p-3 font-mono text-xs text-ink outline-none focus:border-brand"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" disabled={running} onClick={() => onAnalyse(pgn, depth)}>
          Analyser
        </Button>
        {running && (
          <Button variant="danger" onClick={onStop}>
            Arrêter
          </Button>
        )}
        <label htmlFor="depth" className="ml-1 text-sm text-muted">
          Profondeur
        </label>
        <Select id="depth" value={depth} options={DEPTH_OPTIONS} onChange={(e) => setDepth(Number(e.target.value))} />
        <Button onClick={() => setPgn(EXAMPLE_PGN)}>Exemple</Button>
      </div>
      {(running || progress > 0) && (
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
      )}
      {status && <p className="mt-2 text-xs text-muted">{status}</p>}
      {error && <p className="mt-2 text-sm text-[#ff7b72]">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Sur chess.com : fin de partie → <b>Partager</b> → onglet <b>PGN</b> → Copier. Les commentaires d’horloge{" "}
        <code>{"{[%clk …]}"}</code> sont acceptés.
      </p>
    </div>
  );
}
