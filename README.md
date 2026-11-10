# ChessGameAnalizer

Analyse tes parties d'échecs avec **Stockfish**, gratuitement et directement dans le navigateur.
Colle le PGN d'une partie chess.com et obtiens l'évaluation de chaque coup, sans abonnement et sans serveur.

👉 **Démo : https://huzeyfe-ckr.github.io/ChessGameAnalizer/**

## Stack

- **Next.js 16** (App Router, export statique) + **React 19** + **TypeScript**
- **Three.js** via **React Three Fiber**, **Drei** et **@react-three/postprocessing** : hero 3D cinématique (modèle GLB, profondeur de champ, bloom, grain)
- **Tailwind CSS 4**
- **chess.js** pour lire le PGN et **Stockfish** (Web Worker) pour l'analyse

## Fonctionnalités

- Import d'un PGN chess.com (horloges `{[%clk …]}` gérées) ou d'une simple liste de coups
- Analyse de chaque position par Stockfish, profondeur réglable (10 à 18)
- Classification des coups : Meilleur coup ★, Excellent, Bon, Forcé, Imprécision ?!, Erreur ?, Gaffe ??
- Précision de chaque joueur, meilleur coup affiché par une flèche, variante du moteur
- Barre d'évaluation, graphique cliquable, navigation au clavier (← →), plateau retournable
- 

| Perte de chances de gain | Classification |
|---|---|
| coup du moteur | Meilleur coup |
| < 2 % | Excellent |
| < 5 % | Bon |
| < 10 % | Imprécision |
| < 20 % | Erreur |
| ≥ 20 % | Gaffe |

## Limites

- Stockfish 10 en JavaScript pur : environ 1 s par position en profondeur 14
- Pas de livre d'ouvertures : les premiers coups peuvent être classés de façon un peu bruitée
- La précision ne correspond pas exactement au calcul de chess.com

## Licence

GPL-3.0 (voir `LICENSE`), car le projet inclut Stockfish. chess.js est sous licence BSD-2-Clause.
