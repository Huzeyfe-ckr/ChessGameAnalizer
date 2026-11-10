import type { Move } from "chess.js";

export type Color = "w" | "b";

export type MoveClass =
  | "best"
  | "excellent"
  | "good"
  | "forced"
  | "inaccuracy"
  | "mistake"
  | "blunder";

/** Évaluation d'une position, toujours du point de vue des Blancs. */
export interface PositionEval {
  cp: number;
  mate: number | null;
  best: string | null;
  bestSan: string | null;
  pv: string[];
  pvSan: string[];
}

export interface MoveResult {
  cls: MoveClass;
  /** Perte de chances de gain (0-100) pour le joueur qui a joué le coup. */
  delta: number;
  accuracy: number;
  color: Color;
}

export interface LoadedGame {
  fens: string[];
  moves: Move[];
  white: string;
  black: string;
}
