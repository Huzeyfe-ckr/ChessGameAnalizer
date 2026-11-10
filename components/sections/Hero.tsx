"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";

// Three.js n'existe que côté navigateur : on désactive le rendu serveur de la scène.
const ChessScene = dynamic(() => import("@/components/three/ChessScene"), {
  ssr: false,
  loading: () => null,
});


export function Hero() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#14110e]">
      {/* Scène 3D */}
      <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${ready ? "opacity-100" : "opacity-0"}`}>
        <ChessScene onReady={onReady} />
      </div>

      {/* Dégradés pour la lisibilité du texte et la transition vers la page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[#14110e] via-[#14110e]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Contenu centré */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center px-5 pt-[15vh] text-center sm:pt-[12vh]">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.42em] text-[#d9c7a8]/80 transition-all delay-200 duration-1000 ${
            ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Analyse d’échecs · Stockfish
        </span>

        <h1
          className={`mt-6 max-w-4xl font-display text-[2.6rem] font-medium leading-[1.02] tracking-tight text-[#f3ece0] transition-all delay-300 duration-1000 sm:text-7xl lg:text-[5rem] ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Chaque coup,
          <br />
          <em className="font-normal italic text-[#e8b889]">enfin compris.</em>
        </h1>

        <p
          className={`mt-6 max-w-4xl text-[16px] leading-relaxed text-white transition-all font-bold delay-500 duration-1000 sm:text-base ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Colle ta partie chess.com. Stockfish évalue chaque coup, repère tes gaffes et te montre le meilleur
          coup. Gratuitement, sans abonnement.
        </p>

      </div>
    </section>
  );
}
