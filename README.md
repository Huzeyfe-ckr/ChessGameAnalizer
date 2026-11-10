# ChessGameAnalizer

Analyse tes parties d'échecs avec **Stockfish**, gratuitement et directement dans le navigateur.
Tu colles le PGN d'une partie chess.com, et l'application évalue chaque coup, repère les erreurs et montre le meilleur coup, sans abonnement et sans serveur.

👉 **Démo : https://huzeyfe-ckr.github.io/ChessGameAnalizer/**

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Lancer le projet](#lancer-le-projet)
- [Architecture des fichiers](#architecture-des-fichiers)
- [Comment fonctionne l'analyse](#comment-fonctionne-lanalyse)
- [Le hero 3D](#le-hero-3d)
- [Déploiement](#déploiement)
- [Limites connues](#limites-connues)
- [Licence](#licence)

---

## Fonctionnalités

- **Import d'un PGN chess.com** (les commentaires d'horloge `{[%clk …]}` sont gérés) ou d'une simple liste de coups (`1. e4 e5 2. Nf3 …`)
- **Analyse de chaque position** par Stockfish, avec une profondeur réglable de 10 à 18
- **Classification des coups**, comme sur chess.com : Meilleur coup ★, Excellent, Bon, Forcé, Imprécision ?!, Erreur ?, Gaffe ??
- **Précision de chaque joueur**, et le nombre de coups dans chaque catégorie
- **Meilleur coup** affiché par une flèche sur l'échiquier, avec la variante proposée par le moteur
- **Barre d'évaluation** et **graphique de la partie** (cliquable pour aller à un coup)
- **Navigation au clavier** (← →, Début, Fin) et plateau retournable
- **Hero 3D cinématique** : jeu d'échecs en GLB, profondeur de champ, lumière en contre-jour, braises en suspension

## Stack technique

| Outil | Rôle |
|---|---|
| [Next.js 16](https://nextjs.org) (App Router) | Framework React, export en site statique |
| React 19 + TypeScript | Interface et typage |
| [Tailwind CSS 4](https://tailwindcss.com) | Styles |
| [Three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs) + [Drei](https://drei.docs.pmnd.rs) | Scène 3D du hero |
| [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | Profondeur de champ, bloom, grain, vignettage |
| [chess.js](https://github.com/jhlywa/chess.js) | Lecture du PGN, règles du jeu, coups légaux |
| [Stockfish 10 (stockfish.js)](https://github.com/niklasf/stockfish.js) | Moteur d'analyse, exécuté dans un Web Worker |
| Fontsource | Polices Inter, JetBrains Mono et Playfair Display, intégrées au projet |

## Lancer le projet

Il faut **Node.js 20.9 ou plus récent**.

```bash
git clone https://github.com/Huzeyfe-ckr/ChessGameAnalizer.git
cd ChessGameAnalizer
npm install
npm run dev
```

Puis ouvre **http://localhost:3000**.

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement, avec rechargement automatique |
| `npm run build` | Génère le site statique dans `out/` |
| `npm start` | Sert le dossier `out/` en local, pour tester la version de production |
| `npm run lint` | Vérifie les types TypeScript |

---

## Architecture des fichiers

```
ChessGameAnalizer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── sections/
│   ├── three/
│   └── analyzer/
├── hooks/
├── lib/
├── types/
├── public/
│   ├── models/
│   └── stockfish/
├── .github/workflows/
└── fichiers de configuration
```

### `app/` : les pages (App Router de Next.js)

| Fichier | Rôle |
|---|---|
| `layout.tsx` | Layout racine, commun à tout le site : balise `<html lang="fr">`, import des polices et du CSS global, métadonnées (titre, description, Open Graph) |
| `page.tsx` | Page d'accueil. Elle assemble les sections dans l'ordre : `Navbar`, `Hero`, `HowItWorks`, `AnalyzerSection`, `Footer` |
| `globals.css` | Import de Tailwind et définition du thème (`@theme`) : couleurs (`background`, `surface`, `brand`…), polices (`font-sans`, `font-display`, `font-mono`), classes des pièces de l'échiquier 2D |

### `components/ui/` : composants génériques réutilisables

Petits composants sans logique métier, utilisables partout.

| Fichier | Rôle |
|---|---|
| `Button.tsx` | Bouton avec 4 variantes : `primary`, `secondary`, `danger`, `ghost` |
| `Card.tsx` | Conteneur à bordure arrondie, utilisé pour les panneaux de l'analyseur |
| `Select.tsx` | Liste déroulante stylée, qui reçoit ses options en tableau |
| `Badge.tsx` | `MoveBadge` : pastille colorée de classification d'un coup (★, ?!, ?, ??) |
| `ProgressBar.tsx` | Barre de progression de l'analyse |

### `components/layout/` : structure de la page

| Fichier | Rôle |
|---|---|
| `Navbar.tsx` | Barre de navigation fixe en haut : logo, liens vers les sections, lien GitHub |
| `Footer.tsx` | Pied de page : crédits, mention de Stockfish (GPL-3.0), lien vers le code source |

### `components/sections/` : les grandes sections de la page d'accueil

| Fichier | Rôle |
|---|---|
| `Hero.tsx` | Section plein écran : la scène 3D en fond et le texte centré par-dessus (surtitre, titre, sous-titre, boutons). La scène est chargée avec `next/dynamic` et `ssr: false`, car Three.js ne fonctionne que dans le navigateur. Le texte apparaît en fondu quand la 3D est prête |
| `HowItWorks.tsx` | Les 3 étapes : copier la partie, analyse par Stockfish, comprendre ses erreurs |
| `AnalyzerSection.tsx` | Titre de la section et intégration du composant `Analyzer` |

### `components/three/` : la scène 3D

| Fichier | Rôle |
|---|---|
| `ChessScene.tsx` | Toute la scène du hero : chargement du GLB, mise en place des pièces, caméra animée, lumières, braises (`Sparkles`) et effets de post-traitement. Détails dans [Le hero 3D](#le-hero-3d) |

### `components/analyzer/` : l'analyseur de parties

| Fichier | Rôle |
|---|---|
| `Analyzer.tsx` | Composant principal de l'analyseur. Il récupère l'état via le hook `useGameAnalysis`, dispose l'échiquier à gauche et les panneaux à droite, et gère la navigation au clavier et le retournement du plateau |
| `PgnInput.tsx` | Zone de texte pour coller le PGN, choix de la profondeur, boutons Analyser / Arrêter / Exemple, barre de progression, messages d'état et d'erreur |
| `Board.tsx` | Échiquier 2D (grille CSS de 64 cases) : pièces en glyphes Unicode, surbrillance du dernier coup, pastille de classification sur la case d'arrivée, flèche SVG du meilleur coup |
| `EvalBar.tsx` | Barre d'évaluation verticale : la part blanche correspond à la probabilité de gain des Blancs |
| `EvalGraph.tsx` | Courbe d'évaluation de toute la partie en SVG. Les points colorés marquent les erreurs et le trait vert la position affichée. Un clic sur la courbe va au coup correspondant |
| `MoveList.tsx` | Liste des coups sur deux colonnes (Blancs / Noirs), avec les pastilles de classification. Un clic sur un coup y va, et la liste défile automatiquement jusqu'au coup affiché |
| `MoveDetails.tsx` | Détail du coup affiché : classification, évaluation, meilleur coup qu'il fallait jouer et sa variante, perte de chances de gain, suite conseillée |
| `Summary.tsx` | Tableau récapitulatif : précision de chaque joueur et nombre de coups par catégorie |

### `hooks/` : la logique d'état

| Fichier | Rôle |
|---|---|
| `useGameAnalysis.ts` | Le « cerveau » de l'analyseur. Il charge le PGN, crée le moteur Stockfish une seule fois, analyse les positions une par une en mettant l'interface à jour au fur et à mesure, et gère l'arrêt et la position affichée (`ply`). Il renvoie tout l'état aux composants : `game`, `evals`, `results`, `ply`, `progress`, `status`, `error`, `analyse()`, `stop()`, `goTo()` |

### `lib/` : la logique métier, sans React

| Fichier | Rôle |
|---|---|
| `engine.ts` | Classe `StockfishEngine` : client UCI autour du Web Worker Stockfish. Elle envoie `position fen …` puis `go depth …`, lit les lignes `info … score …` et `bestmove`, et ramène toujours le score au point de vue des Blancs |
| `analysis.ts` | Fonctions de calcul : probabilité de gain (`winPercent`), classification d'un coup (`classifyMove`), précision (`accuracyFromDelta`, `playerAccuracy`), formatage de l'évaluation (`+1.25`, `M3`), conversion des coups du moteur en notation lisible (`uciToSan`, `pvToSan`), positions terminales (mat, pat) |
| `pgn.ts` | `loadGame()` : nettoie le PGN (commentaires, horloges, annotations), le lit avec chess.js, et en cas d'échec rejoue les coups un par un pour indiquer celui qui pose problème. Renvoie toutes les positions (FEN), les coups et le nom des joueurs avec leur Elo |
| `constants.ts` | Valeurs partagées : profondeurs proposées, libellés, symboles et couleurs des classifications, glyphes des pièces, PGN d'exemple |
| `site.ts` | Informations du site : nom, auteur, description, lien GitHub |

### `types/`

| Fichier | Rôle |
|---|---|
| `chess.ts` | Types TypeScript partagés : `Color`, `MoveClass`, `PositionEval` (évaluation d'une position), `MoveResult` (résultat d'un coup), `LoadedGame` (partie chargée) |

### `public/` : fichiers servis tels quels

| Fichier | Rôle |
|---|---|
| `models/chess-set.glb` | Jeu d'échecs 3D du hero, compressé (voir [Le hero 3D](#le-hero-3d)) |
| `stockfish/stockfish.js` | Moteur Stockfish 10 compilé en JavaScript, chargé comme Web Worker |

### Configuration

| Fichier | Rôle |
|---|---|
| `next.config.ts` | Export statique (`output: "export"`) et `basePath`, lu dans la variable `NEXT_PUBLIC_BASE_PATH` (vide en local, `/ChessGameAnalizer` sur GitHub Pages) |
| `postcss.config.mjs` | Branche Tailwind CSS 4 sur PostCSS |
| `tsconfig.json` | Configuration TypeScript, avec l'alias `@/` pour la racine du projet (`@/lib/engine`…) |
| `package.json` | Dépendances et scripts npm |
| `.github/workflows/deploy.yml` | Build et déploiement automatique sur GitHub Pages à chaque push sur `main` |
| `.gitignore` | Exclut `node_modules/`, `.next/`, `out/`… |
| `LICENSE` | Licence GPL-3.0 |

---

## Comment fonctionne l'analyse

### Vue d'ensemble

```
PGN collé
   │
   ▼
lib/pgn.ts ─────────► liste des positions (FEN) + liste des coups
   │
   ▼
hooks/useGameAnalysis.ts : pour chaque position i
   │
   ├── position terminale (mat / pat) ? → évaluation directe, sans moteur
   │
   └── sinon → lib/engine.ts → Stockfish (Web Worker)
                    │
                    └── score + meilleur coup + variante
   │
   ▼
lib/analysis.ts : classification du coup i-1
(comparaison de l'évaluation avant et après le coup)
   │
   ▼
Mise à jour de l'interface (échiquier, liste, graphique, résumé)
```

### 1. Lecture de la partie

`loadGame()` retire les commentaires `{…}` (dont les horloges chess.com) et les annotations `$1`, puis donne le texte à chess.js. Le résultat est la liste des **positions** : la position de départ, puis la position après chaque coup. Pour une partie de N coups, il y a N + 1 positions à analyser.

### 2. Analyse par Stockfish

Stockfish tourne dans un **Web Worker**, un fil d'exécution séparé : l'interface reste fluide pendant l'analyse. La communication passe par le protocole **UCI** :

```
→ uci                         ← uciok
→ isready                     ← readyok
→ position fen <FEN>
→ go depth 14
                              ← info depth 14 score cp 35 ... pv e2e4 e7e5 ...
                              ← bestmove e2e4
```

Pour chaque position, on garde :
- **le score** : en centipions (`cp 35` = +0,35 pion) ou en mat (`mate 3` = mat en 3) ;
- **le meilleur coup** (`bestmove`) ;
- **la variante principale** (`pv`), convertie en notation lisible (`Nf3 Nc6 Bb5…`).

Stockfish donne le score du point de vue **du joueur qui a le trait**. `engine.ts` le ramène toujours au point de vue **des Blancs**, pour pouvoir comparer les positions entre elles.

### 3. Probabilité de gain

Un écart en centipions n'a pas le même poids partout : passer de 0 à +2 change la partie, passer de +8 à +10 ne change rien. On convertit donc chaque score en **probabilité de gain** (entre 0 et 100 %), avec la formule utilisée par Lichess :

```
gain% = 50 + 50 × (2 / (1 + e^(−0.00368208 × cp)) − 1)
```

| Score | Probabilité de gain des Blancs |
|---|---|
| 0,00 | 50 % |
| +1,00 | ~68 % |
| +3,00 | ~90 % |
| Mat pour les Blancs | ~100 % |

### 4. Classification d'un coup

Pour un coup joué, on compare la probabilité de gain **du joueur qui a joué** avant et après son coup. La différence s'appelle la **perte** (`delta`).

| Règle (dans l'ordre) | Classification |
|---|---|
| Un seul coup légal possible | Forcé □ |
| Le coup joué est celui de Stockfish, ou il donne mat | Meilleur coup ★ |
| Perte < 2 % | Excellent ! |
| Perte < 5 % | Bon ✓ |
| Perte < 10 % | Imprécision ?! |
| Perte < 20 % | Erreur ? |
| Perte ≥ 20 % | Gaffe ?? |

Exemple : avant ton coup tu as 70 % de chances de gagner, après tu n'en as plus que 45 %. La perte est de 25 %, donc c'est une **Gaffe**.

### 5. Précision

Chaque coup reçoit une précision entre 0 et 100, à partir de sa perte (formule Lichess) :

```
précision = 103.1668 × e^(−0.04354 × perte) − 3.1669
```

Un coup sans perte vaut 100. La précision d'un joueur est la **moyenne** de ses coups.

### 6. Profondeur d'analyse

La profondeur est le nombre de demi-coups que Stockfish calcule à l'avance. Plus elle est grande, plus l'analyse est fiable, mais plus elle est lente :

| Profondeur | Temps par position (environ) | Usage |
|---|---|---|
| 10 | < 0,5 s | Aperçu rapide |
| 14 | ~1 s | Bon compromis (par défaut) |
| 18 | plusieurs secondes | Analyse fine |

---


## Limites connues

- **Moteur ancien** : Stockfish 10 en JavaScript pur, plus lent et moins fort que les versions récentes en WebAssembly
- **Pas de livre d'ouvertures** : les premiers coups peuvent être classés de façon un peu bruitée
- **Précision** : calculée avec la formule de Lichess, elle ne correspond pas exactement à celle de chess.com
- **3D** : la profondeur de champ demande une carte graphique correcte ; sur un appareil ancien, l'animation peut ralentir

## Licence

Ce projet est distribué sous licence **GPL-3.0** (voir `LICENSE`), car il inclut Stockfish, lui-même sous GPL-3.0.
`chess.js` est sous licence BSD-2-Clause © Jeff Hlywa.
