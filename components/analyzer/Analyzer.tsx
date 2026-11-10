"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Board } from "@/components/analyzer/Board";
import { EvalBar } from "@/components/analyzer/EvalBar";
import { EvalGraph } from "@/components/analyzer/EvalGraph";
import { MoveDetails } from "@/components/analyzer/MoveDetails";
import { MoveList } from "@/components/analyzer/MoveList";
import { PgnInput } from "@/components/analyzer/PgnInput";
import { Summary } from "@/components/analyzer/Summary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGameAnalysis } from "@/hooks/useGameAnalysis";
import { playerAccuracy } from "@/lib/analysis";

const START_FEN = new Chess().fen();

function PlayerRow({ name, acc }: { name: string; acc: number | null }) {
  return (
    <div className="flex items-center justify-between px-0.5 py-2 text-sm font-semibold">
      <span>{name}</span>
      {acc !== null && <span className="font-mono text-xs text-muted">Précision {acc.toFixed(1)}</span>}
    </div>
  );
}

export function Analyzer() {
  const { game, evals, results, ply, running, progress, status, error, analyse, stop, goTo } = useGameAnalysis();
  const [flipped, setFlipped] = useState(false);

  const fen = game?.fens[ply] ?? START_FEN;
  const lastMove = game && ply > 0 ? game.moves[ply - 1] : null;
  const lastResult = ply > 0 ? (results[ply - 1] ?? null) : null;
  const evalNow = evals[ply] ?? null;
  const lastPly = game ? game.fens.length - 1 : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "SELECT" || tag === "INPUT") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(ply - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(ply + 1); }
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(lastPly);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, ply, lastPly]);

  const white = game?.white ?? "Blancs";
  const black = game?.black ?? "Noirs";
  const accW = playerAccuracy(results, "w");
  const accB = playerAccuracy(results, "b");
  const top = flipped ? { name: white, acc: accW } : { name: black, acc: accB };
  const bottom = flipped ? { name: black, acc: accB } : { name: white, acc: accW };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(320px,1fr)]">
      <div className="min-w-0">
        <div className="pl-8">
          <PlayerRow {...top} />
        </div>
        <div className="flex gap-2">
          <EvalBar evaluation={evalNow} flipped={flipped} />
          <div className="min-w-0 flex-1">
            <Board
              fen={fen}
              lastMove={lastMove}
              lastResult={lastResult}
              bestMove={evalNow?.best ?? null}
              flipped={flipped}
            />
          </div>
        </div>
        <div className="pl-8">
          <PlayerRow {...bottom} />
          <div className="mt-1 grid grid-cols-5 gap-1.5">
            <Button title="Début" onClick={() => goTo(0)}>⏮</Button>
            <Button title="Coup précédent (←)" onClick={() => goTo(ply - 1)}>◀</Button>
            <Button title="Coup suivant (→)" onClick={() => goTo(ply + 1)}>▶</Button>
            <Button title="Fin" onClick={() => goTo(lastPly)}>⏭</Button>
            <Button title="Retourner le plateau" onClick={() => setFlipped((f) => !f)}>⇅</Button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <PgnInput running={running} progress={progress} status={status} error={error} onAnalyse={analyse} onStop={stop} />
        </Card>

        {results.some(Boolean) && (
          <Card>
            <Summary results={results} white={white} black={black} />
          </Card>
        )}

        {game && (
          <Card className="p-3">
            <EvalGraph evals={evals} results={results} ply={ply} onSelect={goTo} />
          </Card>
        )}

        <Card>
          {game ? (
            <MoveDetails
              ply={ply}
              move={lastMove}
              fenBefore={ply > 0 ? game.fens[ply - 1] : null}
              result={lastResult}
              evalBefore={ply > 0 ? (evals[ply - 1] ?? null) : null}
              evalNow={evalNow}
            />
          ) : (
            <p className="text-sm text-muted">Aucune partie chargée.</p>
          )}
        </Card>

        <Card>
          <MoveList moves={game?.moves ?? []} results={results} ply={ply} startFen={game?.fens[0] ?? START_FEN} onSelect={goTo} />
        </Card>
      </div>
    </div>
  );
}
