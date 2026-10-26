# GRANDMASTER OS — THE PRIVATE CHESS ACADEMY
> **Offline-first, Zero-Cloud Personal Chess Laboratory for Windows 10/11**

[![Tests](https://img.shields.io/badge/Acceptance%20Tests-26%2F26%20Passing-emerald)](#automated-test-results)
[![Privacy](https://img.shields.io/badge/Telemetry-0%25%20Air--Gapped-blue)](#privacy--data-sovereignty)
[![Engine](https://img.shields.io/badge/Stockfish%20UCI-Authentic%20Offline-orange)](#chess-engine-integration)
[![License](https://img.shields.io/badge/License-GPL%20v3%20%2F%20MIT-lightgrey)](#licenses--third-party-notices)

---

## 1. Executive Summary

**Grandmaster OS** is a tournament-grade, offline-first personal chess laboratory designed for one dedicated player who wants to advance from beginner to competitive mastery. 

It does not make false promises of overnight grandmaster strength. Instead, it provides an evidence-based training environment that methodically discovers weaknesses, explains mistakes through human and engine principles, and guides calculation trees using deterministic local reasoning.

---

## 2. Core Non-Negotiable Features

1. **Air-Gapped & Offline-First**: Zero external accounts, zero tracking beacons, zero remote LLMs or APIs. All data, games, notes, and profiles remain strictly on your local disk.
2. **12 Comprehensive Modules**:
   - **Home**: Private academy dashboard with personalized greeting, streaks, and customized daily training.
   - **Play Chess**: Play against Stockfish (Beginner ~1000 Elo, Intermediate ~1400 Elo, Advanced ~1850 Elo, Master), 2-player pass-and-play, practice mode with undo, and custom position setup with Fischer increment clocks.
   - **Analysis Lab**: Full-game evaluation graph, centipawn swing tracking, CAPS-style accuracy metrics, and move classifications (`★` Best, `✓` Excellent, `○` Good, `?!` Inaccuracy, `?` Mistake, `??` Blunder, `≠` Missed Win, `□` Forced).
   - **The Grandmaster Coach**: Contextual questions answered deterministically without remote AI (*"Why was my move a mistake?"*, *"What was my opponent threatening?"*, *"What plan should I follow?"*, *"Quiz me on candidate moves"*).
   - **Academy**: 7-stage progressive curriculum from board fundamentals to competitive tournament mastery with interactive move validation.
   - **Tactics Gym**: Curated tactical puzzles (Mate in 1, Mate in 2, Forks, Pins, Skewers, Discovered Attacks, Endgames) with 3-tier intelligent hints.
   - **Opening Lab**: Searchable opening encyclopedia with ECO codes, plans, pawn structures, tactical motifs, and trap warnings.
   - **My Repertoire**: White and Black repertoire builder with find-the-next-move memorization mode and deviation feedback.
   - **My Mistakes**: Automated blunder repository converting real game errors into spaced repetition replay drills.
   - **Endgame Lab**: Theoretical drills covering the Lucena position, Philidor defense, opposition, rook checkmates, and bishop fortresses.
   - **Game Library**: Local database with PGN/FEN import, export, search, and filtering.
   - **Progress**: Evidence-based analytics detailing games played, win rate by color, tactical success, and lesson completion.
   - **Settings & Privacy**: Board themes (Tournament Green, Classic Wood, Slate, Monochrome, High-Contrast), procedural audio synthesis, Stockfish CPU/Hash limits, and 1-click JSON backup/restore.

---

## 3. Technology Stack

- **Desktop Shell**: Electron + Vite + React 19 + TypeScript 5
- **Design System**: Tailwind CSS with custom chess palettes (warm white, dark charcoal, restrained tournament green, muted red)
- **Chess Engine**: Authentic Stockfish UCI engine integration with zero-install WebAssembly worker fallback
- **Rules System**: Battle-tested `chess.js` engine enforcing all standard rules (en passant, promotion, castling, 50-move rule, threefold repetition, insufficient material)
- **Sound**: Procedural Web Audio API synthesizer for board moves, captures, checks, and game termination (zero external media files required)
- **Persistence**: Transactional local storage with schema migrations and JSON export/import

---

## 4. Getting Started & Development

### Prerequisites
- Node.js v18+ (tested on v24.15.0)
- Windows 10/11 (or macOS / Linux)

### Installation
```bash
# Clone or navigate to the workspace
cd f:\Work\chess

# Install dependencies (runs offline with bundled resources)
npm install
```

### Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser or desktop window.

### Production Build
```bash
npm run build
```
Compiles TypeScript, processes Tailwind CSS, and outputs the optimized static distribution to `dist/`.

---

## 5. Automated Test Results

Execute the complete 26-test suite:
```bash
npm run test
```

### Verified Acceptance Test Suite (26 / 26 Passing)
```
 ✓ tests/acceptance.test.ts (26 tests) 76ms
   ✓ 1. Legal opening sequence can be played (1.e4 e5 2.Nf3 Nc6 3.Bc4)
   ✓ 2. Illegal moves are rejected and do not mutate state
   ✓ 3. Castling works correctly (kingside & queenside, restricted during check)
   ✓ 4. En passant works correctly
   ✓ 5. Pawn promotion works correctly to Q, R, B, N
   ✓ 6. Checkmate is detected (Scholar's Mate)
   ✓ 7. Stalemate is detected
   ✓ 8. Draw conditions (Threefold repetition & Insufficient material) handled
   ✓ 9. Game state can be saved and restored with identical move history
   ✓ 10. PGN import/export preserves the move sequence
   ✓ 11. FEN positions load and validate properly
   ✓ 12. UCI engine output parses depth, score, multipv, and pv
   ✓ 13. MultiPV candidate line ranking logic
   ✓ 14. Move classifications (Best, Inaccuracy, Mistake, Blunder, Forced)
   ✓ 15. Move analysis correctly correlates to position before and after move
   ✓ 16. Grandmaster 8-point explanation generated for blunders
   ✓ 17. Academy lessons record actual completion state
   ✓ 18. Curated puzzles have verified starting FEN and solution moves
   ✓ 19. Repertoire line validates correct move and flags deviation
   ✓ 20. SM-2 spaced repetition computes intervals and persists review date
   ✓ 21. Offline guarantee: All services function locally without network dependencies
   ✓ 22. Network sandbox: window.fetch and XMLHttpRequest remain untouched
   ✓ 23. Fresh installation contains 0 fake games and empty stats
   ✓ 24. Complete backup and restore recovers all profiles, games, and progress
   ✓ 25. Destructive reset wipes data cleanly when executed
   ✓ 26. Complete End-to-End Workflow Integration Test
```

---

## 6. Privacy & Data Sovereignty

- **Network Sandbox**: A strict Content Security Policy (`default-src 'self'`) prevents any external network requests.
- **Zero Telemetry**: No tracking beacons, analytics scripts, or cloud crash reporters.
- **Local Storage**: All data is saved on your local disk. You can export a complete `.json` backup or wipe your profile with confirmation at any time via Settings.

---

## 7. Licenses & Third-Party Notices

- **Stockfish**: Licensed under the GNU General Public License v3 (GPLv3).
- **chess.js**: Licensed under the MIT License.
- **Lucide Icons**: Licensed under the ISC License.
- **React & Tailwind CSS**: Licensed under the MIT License.
