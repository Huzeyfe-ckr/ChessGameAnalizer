import type { MoveClass } from "@/types/chess";

export const MATE_SCORE = 100_000;

export const DEFAULT_DEPTH = 14;

export const DEPTH_OPTIONS = [
  { value: 10, label: "10 (rapide)" },
  { value: 12, label: "12" },
  { value: 14, label: "14 (conseillé)" },
  { value: 16, label: "16 (lent)" },
  { value: 18, label: "18 (très lent)" },
];

export const MOVE_CLASSES: Record<MoveClass, { label: string; symbol: string; color: string }> = {
  best: { label: "Meilleur coup", symbol: "★", color: "#81b64c" },
  excellent: { label: "Excellent", symbol: "!", color: "#96bc4b" },
  good: { label: "Bon", symbol: "✓", color: "#95af8a" },
  forced: { label: "Forcé", symbol: "□", color: "#9a968f" },
  inaccuracy: { label: "Imprécision", symbol: "?!", color: "#f7c045" },
  mistake: { label: "Erreur", symbol: "?", color: "#e58f2a" },
  blunder: { label: "Gaffe", symbol: "??", color: "#ca3431" },
};

export const MOVE_CLASS_ORDER: MoveClass[] = [
  "best",
  "excellent",
  "good",
  "forced",
  "inaccuracy",
  "mistake",
  "blunder",
];

export const PIECE_GLYPHS: Record<string, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

export const EXAMPLE_PGN = `[White "Paul Morphy"]
[Black "Duc de Brunswick"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;
