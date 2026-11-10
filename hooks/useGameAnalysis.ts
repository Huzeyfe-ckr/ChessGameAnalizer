"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { classifyMove, pvToSan, terminalEval, uciToSan } from "@/lib/analysis";
import { StockfishEngine } from "@/lib/engine";
import { loadGame } from "@/lib/pgn";
import type { LoadedGame, MoveResult, PositionEval } from "@/types/chess";

export function useGameAnalysis() {
  const [game, setGame] = useState<LoadedGame | null>(null);
  const [evals, setEvals] = useState<(PositionEval | null)[]>([]);
  const [results, setResults] = useState<(MoveResult | null)[]>([]);
  const [ply, setPly] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const engineRef = useRef<StockfishEngine | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => () => engineRef.current?.terminate(), []);

  const analyse = useCallback(async (pgn: string, depth: number) => {
    setError("");
    let loaded: LoadedGame;
    try {
      loaded = loadGame(pgn);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PGN invalide.");
      return;
    }

    const total = loaded.fens.length;
    const nextEvals: (PositionEval | null)[] = new Array(total).fill(null);
    const nextResults: (MoveResult | null)[] = new Array(loaded.moves.length).fill(null);
    setGame(loaded);
    setEvals([...nextEvals]);
    setResults([...nextResults]);
    setPly(0);
    setProgress(0);

    try {
      engineRef.current ??= new StockfishEngine();
    } catch (e) {
      setError(`Impossible de démarrer Stockfish : ${e instanceof Error ? e.message : e}`);
      return;
    }

    cancelRef.current = false;
    setRunning(true);
    const start = performance.now();

    for (let i = 0; i < total; i++) {
      if (cancelRef.current) break;
      setStatus(`Analyse de la position ${i + 1}/${total} (profondeur ${depth})…`);
      const fen = loaded.fens[i];
      const terminal = terminalEval(fen);
      let ev: PositionEval;
      if (terminal) ev = terminal;
      else {
        const raw = await engineRef.current.analyse(fen, depth);
        ev = { ...raw, bestSan: uciToSan(fen, raw.best), pvSan: pvToSan(fen, raw.pv) };
      }
      nextEvals[i] = ev;
      if (i > 0) {
        nextResults[i - 1] = classifyMove(loaded.moves[i - 1], loaded.fens[i - 1], nextEvals[i - 1]!, ev);
      }
      setEvals([...nextEvals]);
      setResults([...nextResults]);
      setProgress((i + 1) / total);
    }

    const seconds = ((performance.now() - start) / 1000).toFixed(1);
    setStatus(cancelRef.current ? "Analyse arrêtée." : `Analyse terminée en ${seconds} s.`);
    setRunning(false);
  }, []);

  const stop = useCallback(() => {
    cancelRef.current = true;
    engineRef.current?.stop();
  }, []);

  const goTo = useCallback(
    (p: number) => {
      if (!game) return;
      setPly(Math.max(0, Math.min(game.fens.length - 1, p)));
    },
    [game],
  );

  return { game, evals, results, ply, running, progress, status, error, analyse, stop, goTo };
}
