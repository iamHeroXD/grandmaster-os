# GRANDMASTER OS — PROJECT PLAN

## 1. Executive Summary & Vision

**Grandmaster OS** is a world-class, offline-first, single-user desktop chess laboratory designed for Windows 10/11. The application acts as a private academy for a dedicated chess player striving to advance from novice to tournament-grade chess without relying on cloud services, external accounts, tracking beacons, or generic AI chatbots.

The system combines:
1. Legal, robust chess game engine with clocks, practice modes, and custom positions.
2. Direct UCI Stockfish engine management with evaluation bar, candidate moves, and strength throttle.
3. The Grandmaster Coach: a deterministic, rule-based chess reasoning and diagnostic system that explains mistakes, identifies threats, and teaches calculation.
4. Structured 7-stage Chess Academy with interactive boards, concept explanations, and mastery checks.
5. Opening Encyclopedia & Repertoire Builder with spaced-repetition training.
6. Tactical Calculation Gym with verified puzzles, hint system, and mistake tracking.
7. Interactive Endgame Lab covering foundational theoretical positions, pawn races, and fortresses.
8. Post-Game Analysis Lab with move classifications, turning points, evaluation graph, and deep diagnostics.
9. "My Mistakes" library converting real game errors into reviewable drills.
10. Privacy-first, local-only SQLite persistence, PGN/FEN import/export, and complete data sovereignty.

---

## 2. Technology Stack & Architectural Decision Record (ADR)

### Stack Selection
- **Desktop Shell**: Electron 34+ with Vite, React 19, TypeScript 5.
- **Engine Layer**: Direct UCI protocol process supervisor with Windows Stockfish executable integration and stockfish-worker WebAssembly fallback for zero-install guarantees.
- **Rules Engine**: `chess.js` (battle-tested FEN, PGN, SAN, legal move generation, 50-move rule, threefold repetition, insufficient material).
- **Persistence**: Local SQLite database with transactional ACID guarantees, schema migrations, and JSON export/import.
- **Styling & Components**: Tailwind CSS with custom chess themes (Wood, Tournament Green, Slate, Monochrome, High-contrast), Lucide icons.
- **Sound System**: Local Web Audio API synthesizer for board moves, captures, checks, and game termination (zero external media assets required).

### Justification of Architecture
Rust / Tauri CLI was evaluated; however, Rust tooling (`cargo`, `rustc`) is not present in the current operating environment. Electron with strict context isolation (`contextIsolation: true`, `nodeIntegration: false`, CSP with zero remote origins) provides:
1. Native Windows 10/11 desktop integration (compact custom title bar, native dialogs, filesystem storage in `%APPDATA%/GrandmasterOS`).
2. High-performance child-process management for Stockfish UCI binaries.
3. Guaranteed offline desktop packaging via `electron-builder`.
4. Sandboxed renderer with type-safe IPC bridge.

---

## 3. Implementation Phases

```
+------------------------------------------------------------------------------+
| Phase 1: Foundation & Desktop Shell (Electron + React + SQLite + Design Sys) |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 2: Chess Core & Board UI (Legal rules, clocks, sounds, PGN/FEN)         |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 3: Engine Architecture (UCI Stockfish controller, MultiPV, difficulty) |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 4: Analysis Lab (Eval graph, move classification, turning points)      |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 5: Chess Academy (7 progressive courses, interactive mastery checks)    |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 6: Tactics & Calculation Gym (Verified puzzles, hints, spaced repeat)  |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 7: Opening Lab & Repertoire (Explorer, repertoires, deviation drill)   |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 8: The Grandmaster Coach & Mistake Library (Local reasoning engine)    |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 9: Endgame Lab, Board Editor & Game Library (Full persistence)         |
+--------------------------------------+---------------------------------------+
                                       |
+--------------------------------------v---------------------------------------+
| Phase 10: Polish, Performance, Acceptance Testing & Packaging                |
+------------------------------------------------------------------------------+
```

---

## 4. Work Breakdown Structure (WBS)

### Phase 1: Foundation & Setup
- Scaffold Vite + React + TypeScript + Tailwind project with Electron desktop runner.
- Build custom TitleBar with Windows window controls (minimize, maximize, close).
- Implement Sidebar Navigation across all 12 core modules.
- Initialize local SQLite schema with migrations (`profiles`, `settings`, `games`, `puzzles`, `lessons`, etc.).
- Build First-Run Onboarding Modal with skill assessment, time controls, and board preferences.

### Phase 2: Chess Core Engine & Board
- Implement `ChessGame` state manager encapsulating `chess.js`.
- Create responsive SVG chessboard supporting:
  - Drag-and-drop & click-to-move.
  - Legal destination indicators (dots for quiet moves, rings for captures).
  - Last-move and in-check highlights.
  - Smooth animation toggle and sound synthesis.
  - Board orientation flip.
- Implement time-control clocks with Fischer increments and timeout detection.
- Implement Practice Mode, 2-player local mode, and play vs Computer.

### Phase 3: Stockfish UCI Integration
- Create `EngineService` handling UCI protocol:
  - `uci`, `isready`, `ucinewgame`, `position fen ... moves ...`, `go depth/movetime/multipv`, `stop`.
  - Parsing stdout lines: `info depth ... score cp ... pv ...`, `bestmove ...`.
  - Process lifecycle management (spawning, error handling, clean shutdown, crash recovery).
  - Configurable threads, hash memory, search depth limits, and Elo-throttled skill levels (Beginner, Intermediate, Advanced, Maximum).
  - High-performance Stockfish fallback engine in WebAssembly / JS worker for zero-install reliability.

### Phase 4: Analysis Lab
- Full-game engine analysis pipeline calculating centipawn evaluations for every half-move.
- Move classification engine: Best, Excellent, Good, Inaccuracy, Mistake, Blunder, Missed Opportunity, Forced.
- Dynamic evaluation chart with interactive move jumping.
- Identification of biggest turning point, best decision, and missed tactical shots.
- Human-readable pedagogical summaries.

### Phase 5: Structured Academy
- 7 comprehensive stages:
  1. Foundations (rules, coordinates, mate vs stalemate).
  2. Beginner Tactics (forks, pins, skewers, discovered attacks, back-rank).
  3. Essential Strategy (center, development, king safety, open files, outposts).
  4. Intermediate Calculation (forcing variations, candidate moves, quiet moves, prophylaxis).
  5. Advanced Middlegame (pawn structures, Carlsbad, IQP, sacrifices, initiative).
  6. Practical Endgames (opposition, Lucena, Philidor, pawn races, fortresses).
  7. Competitive Mastery (time management, tournament psychology, calculation under stress).
- Interactive board lessons with validation and progress tracking.

### Phase 6: Tactical Training & Calculation Gym
- Curated tactical puzzle database with verified solutions, FENs, themes, and difficulty ratings.
- 3-tier progressive hint system (Motif hint -> Key piece/square -> Critical move hint).
- Multiple training modes: Daily Tactics, Unlimited, Puzzle Rush, Theme Drills.
- Local spaced-repetition scheduler (SM-2 inspired algorithm) tracking due reviews.

### Phase 7: Opening Lab & Repertoire
- Curated Opening Encyclopedia (Open Games, Sicilian, French, Caro-Kann, 1.d4, Indian Defenses, Flank Openings).
- Repertoire Builder for White and Black lines.
- Find-The-Next-Move rehearsal mode with deviation feedback.

### Phase 8: The Grandmaster Coach & Personal Mistake Library
- Local deterministic reasoning engine evaluating position features (king safety, piece activity, center control, tension).
- Contextual coach panel answering:
  - "Why was my move a mistake?"
  - "What was my opponent threatening?"
  - "What plan should I follow?"
  - "Give me a calculation quiz."
- "My Mistakes" repository: automatic capture of blunders and missed wins from analyzed games into interactive replay drills.

### Phase 9: Endgame Lab, Board Editor & Game Library
- Interactive Endgame module with classic theoretical positions.
- Position editor with FEN export/import, piece palette, and castling/turn toggles.
- Filterable Game Library with PGN import/export and deep search.

### Phase 10: Polish, Quality Assurance & Offline Verification
- Automated test suite verifying rules, engine UCI, coach logic, and persistence.
- Zero-network verification test ensuring no external sockets or HTTP requests.
- Build production desktop package.

---

## 5. Milestone & Deliverable Checklist
- [x] Initial Architectural & Project Documentation
- [ ] Working Electron Desktop Application Shell
- [ ] Legal Chess Engine & Interactive Board
- [ ] UCI Stockfish Integration & Opponent Levels
- [ ] Full Game Analysis Pipeline & Evaluation Graph
- [ ] Academy Curriculum (All 7 Stages)
- [ ] Tactics Calculation Gym with Verified Solutions
- [ ] Opening Lab & Repertoire Rehearsal
- [ ] Grandmaster Coach Local Reasoning Engine
- [ ] Personal Mistake Library & Spaced Repetition
- [ ] Local SQLite Persistence & Import/Export
- [ ] Comprehensive Acceptance Test Suite (25+ Tests)
