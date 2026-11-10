"use client";

import { useCallback, useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Board } from "@/components/analyzer/Board";
import { CoachBubble } from "@/components/analyzer/CoachBubble";
import { EvalBar } from "@/components/analyzer/EvalBar";
import { EvalGraph } from "@/components/analyzer/EvalGraph";
import { MoveList } from "@/components/analyzer/MoveList";
import { PgnInput } from "@/components/analyzer/PgnInput";
import { PlayerRow } from "@/components/analyzer/PlayerRow";
import { Summary } from "@/components/analyzer/Summary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGameAnalysis } from "@/hooks/useGameAnalysis";
import { playerAccuracy } from "@/lib/analysis";

const START_FEN = new Chess().fen();

type Tab = "moves" | "summary";

export function Analyzer() {
  const { game, evals, results, ply, running, progress, status, error, analyse, stop, reset, goTo } =
    useGameAnalysis();
  const [flipped, setFlipped] = useState(false);
  const [tab, setTab] = useState<Tab>("moves");

  const fen = game?.fens[ply] ?? START_FEN;
  const lastMove = game && ply > 0 ? game.moves[ply - 1] : null;
  const lastResult = ply > 0 ? (results[ply - 1] ?? null) : null;
  const evalNow = evals[ply] ?? null;
  const lastPly = game ? game.fens.length - 1 : 0;

  const startAnalysis = useCallback(
    (pgn: string, depth: number) => {
      setTab("moves");
      analyse(pgn, depth);
      document.getElementById("analyser")?.scrollIntoView({ behavior: "smooth" });
    },
    [analyse],
  );

  // Navigation au clavier, comme sur chess.com
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (!game || tag === "TEXTAREA" || tag === "SELECT" || tag === "INPUT") return;
      const actions: Record<string, () => void> = {
        ArrowLeft: () => goTo(ply - 1),
        ArrowRight: () => goTo(ply + 1),
        ArrowUp: () => goTo(0),
        ArrowDown: () => goTo(lastPly),
        Home: () => goTo(0),
        End: () => goTo(lastPly),
      };
      const action = actions[e.key];
      if (action) {
        e.preventDefault(); // empêche la page de défiler
        action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, goTo, ply, lastPly]);

  const white = { name: game?.white ?? "Blancs", color: "w" as const, accuracy: playerAccuracy(results, "w") };
  const black = { name: game?.black ?? "Noirs", color: "b" as const, accuracy: playerAccuracy(results, "b") };
  const top = flipped ? white : black;
  const bottom = flipped ? black : white;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:h-analyzer lg:grid-analyzer lg:px-8">
      {/* ---------- Échiquier ---------- */}
      <div className="flex min-h-0 items-center justify-center">
        <div className="grid grid-board">
          <span />
          <PlayerRow {...top} />
          <EvalBar evaluation={evalNow} flipped={flipped} />
          <Board fen={fen} lastMove={lastMove} lastResult={lastResult} bestMove={evalNow?.best ?? null} flipped={flipped} />
          <span />
          <PlayerRow {...bottom} />
        </div>
      </div>

      {/* ---------- Panneau « Bilan » ---------- */}
      <Card className="flex h-panel-mobile min-h-0 flex-col overflow-hidden lg:h-full">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2.5 font-display text-xl text-cream">
            <span className="flex size-7 items-center justify-center rounded-full bg-move-best text-sm text-cream">★</span>
            Bilan
          </h2>
          {game && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Nouvelle partie
            </Button>
          )}
        </header>

        {!game ? (
          <PgnInput error={error} onAnalyse={startAnalysis} />
        ) : (
          <>
            {running && (
              <div className="flex items-center gap-3 border-b border-line px-5 py-3">
                <div className="flex-1">
                  <ProgressBar value={progress} />
                  <p className="mt-1.5 text-xs text-muted">{status}</p>
                </div>
                <Button variant="danger" size="sm" onClick={stop}>
                  Arrêter
                </Button>
              </div>
            )}

            {/* Onglets */}
            <div className="flex gap-1 border-b border-line px-3">
              {(
                [
                  ["moves", "Coups"],
                  ["summary", "Résumé"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`border-b-2 px-3 py-3 text-sm font-semibold transition ${
                    tab === id ? "border-gold text-cream" : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "moves" ? (
              <>
                <div className="flex flex-col gap-4 p-5 pb-3">
                  <CoachBubble
                    ply={ply}
                    move={lastMove}
                    result={lastResult}
                    evalBefore={ply > 0 ? (evals[ply - 1] ?? null) : null}
                    evalNow={evalNow}
                    running={running}
                  />
                  <Button variant="accent" size="lg" disabled={ply >= lastPly} onClick={() => goTo(ply + 1)}>
                    Suivant →
                  </Button>
                </div>
                <MoveList moves={game.moves} results={results} ply={ply} startFen={game.fens[0]} onSelect={goTo} />
                <div className="px-5 pb-3 pt-2">
                  <EvalGraph evals={evals} results={results} ply={ply} onSelect={goTo} />
                </div>
              </>
            ) : (
              <Summary results={results} white={game.white} black={game.black} />
            )}

            {/* Navigation */}
            <div className="grid grid-cols-5 gap-2 border-t border-line p-3">
              <Button title="Début (↑)" onClick={() => goTo(0)}>⏮</Button>
              <Button title="Coup précédent (←)" onClick={() => goTo(ply - 1)}>◀</Button>
              <Button title="Coup suivant (→)" onClick={() => goTo(ply + 1)}>▶</Button>
              <Button title="Fin (↓)" onClick={() => goTo(lastPly)}>⏭</Button>
              <Button title="Retourner l’échiquier" onClick={() => setFlipped((f) => !f)}>⇅</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
