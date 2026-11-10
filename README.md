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

## Architecture

```
app/
├── layout.tsx              # Layout racine, polices, métadonnées
├── page.tsx                # Page d'accueil (assemble les sections)
└── globals.css             # Tailwind + thème (couleurs, polices)
components/
├── ui/                     # Composants génériques : Button, Card, Select, Badge, ProgressBar
├── layout/                 # Navbar, Footer
├── sections/               # Hero, HowItWorks, AnalyzerSection
├── three/                  # Scène 3D du hero : ChessScene (Canvas, lumières, mise en scène du GLB)
└── analyzer/               # Analyzer, Board, EvalBar, EvalGraph, MoveList, MoveDetails, PgnInput, Summary
hooks/
└── useGameAnalysis.ts      # État de l'analyse : chargement PGN, boucle Stockfish, navigation
lib/
├── engine.ts               # Client UCI autour du Web Worker Stockfish
├── analysis.ts             # Probabilité de gain, classification, précision, conversions UCI → SAN
├── pgn.ts                  # Lecture et nettoyage du PGN
├── constants.ts            # Classes de coups, profondeurs, PGN d'exemple
└── site.ts                 # Nom, auteur, liens
types/
└── chess.ts                # Types partagés
public/
├── models/chess-set.glb    # Jeu d'échecs 3D (compressé meshopt + textures WebP, ~2 Mo)
└── stockfish/stockfish.js  # Moteur Stockfish 10 (JavaScript)
.github/workflows/
└── deploy.yml              # Build + déploiement automatique sur GitHub Pages
```

## Modèle 3D

Le fichier d'origine (~20 Mo) a été optimisé avec [glTF-Transform](https://gltf-transform.dev) :

```bash
npx @gltf-transform/cli optimize "chess set.glb" public/models/chess-set.glb \
  --compress meshopt --texture-compress webp --texture-size 1024 \
  --join false --instance false --palette false --flatten false
```

## Lancer en local

```bash
npm install
npm run dev
# http://localhost:3000
```

Build de production (export statique dans `out/`) :

```bash
npm run build
npm start
```

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui construit le site et le publie sur GitHub Pages.
À activer une seule fois : **Settings → Pages → Source : GitHub Actions**.

## Comment l'analyse fonctionne

L'évaluation du moteur (centipions ou mat) est convertie en probabilité de gain :

```
gain% = 50 + 50 × (2 / (1 + e^(−0.00368208 × cp)) − 1)
```

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
