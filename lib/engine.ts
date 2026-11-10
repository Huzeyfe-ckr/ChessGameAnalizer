import { mateToCp } from "@/lib/analysis";

export interface RawEval {
  cp: number;
  mate: number | null;
  best: string | null;
  pv: string[];
}

const ENGINE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/stockfish/stockfish.js`;

/** Petit client UCI autour de Stockfish lancé dans un Web Worker. */
export class StockfishEngine {
  private worker: Worker;
  private listener: ((line: string) => void) | null = null;
  private ready: Promise<void>;

  constructor() {
    this.worker = new Worker(ENGINE_URL);
    this.worker.onmessage = (e: MessageEvent) => this.listener?.(String(e.data));
    this.ready = this.command("uci", (l) => l === "uciok").then(() => {
      this.worker.postMessage("setoption name Hash value 16");
      return this.command("isready", (l) => l === "readyok");
    });
  }

  private command(cmd: string, isDone: (line: string) => boolean): Promise<void> {
    return new Promise((resolve) => {
      this.listener = (line) => {
        if (isDone(line)) {
          this.listener = null;
          resolve();
        }
      };
      this.worker.postMessage(cmd);
    });
  }

  async analyse(fen: string, depth: number): Promise<RawEval> {
    await this.ready;
    const sideToMove = fen.split(" ")[1];
    let last: { type: string; value: number; pv: string[] } | null = null;
    let best: string | null = null;

    await new Promise<void>((resolve) => {
      this.listener = (line) => {
        if (line.startsWith("info") && line.includes(" score ") && !/lowerbound|upperbound/.test(line)) {
          const score = line.match(/score (cp|mate) (-?\d+)/);
          const pv = line.match(/ pv (.+)$/);
          if (score) last = { type: score[1], value: parseInt(score[2], 10), pv: pv ? pv[1].split(" ") : [] };
        } else if (line.startsWith("bestmove")) {
          best = line.split(" ")[1] ?? null;
          this.listener = null;
          resolve();
        }
      };
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth}`);
    });

    // Stockfish donne le score du point de vue du trait : on le ramène aux Blancs.
    const sign = sideToMove === "w" ? 1 : -1;
    const info = last as { type: string; value: number; pv: string[] } | null;
    let cp = 0;
    let mate: number | null = null;
    if (info) {
      if (info.type === "cp") cp = info.value * sign;
      else {
        mate = info.value * sign;
        cp = mateToCp(mate);
      }
    }
    return { cp, mate, best: best && best !== "(none)" ? best : null, pv: info?.pv ?? [] };
  }

  stop() {
    this.worker.postMessage("stop");
  }

  terminate() {
    this.worker.terminate();
  }
}
