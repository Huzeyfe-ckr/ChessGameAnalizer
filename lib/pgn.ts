import { Chess } from "chess.js";
import type { LoadedGame } from "@/types/chess";

const RESULT_TOKEN = /^(1-0|0-1|1\/2-1\/2|\*)$/;

function cleanPgn(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\{[^}]*\}/g, " ") // commentaires et horloges chess.com
    .replace(/\$\d+/g, " ") // NAG
    .replace(/[ \t]+/g, " ")
    .trim();
}

function readHeader(headers: Record<string, string>, key: string, fallback: string): string {
  const v = headers[key];
  return v && v !== "?" ? v : fallback;
}

/** Lit un PGN complet ou une simple liste de coups et renvoie toutes les positions. */
export function loadGame(text: string): LoadedGame {
  const cleaned = cleanPgn(text);
  if (!cleaned) throw new Error("Colle d’abord le PGN de ta partie.");

  let game = new Chess();
  let headers: Record<string, string> = {};

  try {
    game.loadPgn(cleaned, { strict: false });
    headers = game.getHeaders();
  } catch {
    // Format non standard : on rejoue coup par coup pour trouver le coup fautif.
    game = new Chess();
    const tokens = cleaned
      .replace(/\[[^\]]*\]/g, " ")
      .split(/\s+/)
      .map((t) => t.replace(/^\d+\.+/, ""))
      .filter((t) => t && !RESULT_TOKEN.test(t));
    for (const t of tokens) {
      try {
        game.move(t, { strict: false });
      } catch {
        throw new Error(`Coup illisible : « ${t} »`);
      }
    }
  }

  const history = game.history({ verbose: true });
  if (!history.length) throw new Error("Aucun coup trouvé dans le texte collé.");

  const fens = [history[0].before, ...history.map((m) => m.after)];

  let white = readHeader(headers, "White", "Blancs");
  let black = readHeader(headers, "Black", "Noirs");
  if (headers.WhiteElo && headers.WhiteElo !== "?") white += ` (${headers.WhiteElo})`;
  if (headers.BlackElo && headers.BlackElo !== "?") black += ` (${headers.BlackElo})`;

  return { fens, moves: history, white, black };
}
