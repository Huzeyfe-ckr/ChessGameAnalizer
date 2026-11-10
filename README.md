# ChessGameAnalizer

Analyse tes parties d'échecs avec **Stockfish**, gratuitement et directement dans le navigateur.
Tu colles le PGN d'une partie chess.com, et l'application évalue chaque coup, repère les erreurs et montre le meilleur coup, sans abonnement et sans serveur.

👉 **Démo : https://huzeyfe-ckr.github.io/ChessGameAnalizer/**

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Lancer le projet](#lancer-le-projet)
- [Comment fonctionne l'analyse](#comment-fonctionne-lanalyse)
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

## Lancer le projet pour faire vos modifications 

Il faut **Node.js 20.9 ou plus récent**.

```bash
git clone https://github.com/Huzeyfe-ckr/ChessGameAnalizer.git
cd ChessGameAnalizer
npm install
npm run dev
```

Puis ouvre **http://localhost:3000**.

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
