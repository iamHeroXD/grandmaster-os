# GRANDMASTER OS — SYSTEM ARCHITECTURE

## 1. Architectural Philosophy & Overview

**Grandmaster OS** is engineered as a zero-cloud, offline-first desktop application designed with strict separation of concerns, deterministic reasoning, high-fidelity chess rules compliance, and resilient multi-process architecture.

```
+---------------------------------------------------------------------------------------+
|                                    WINDOWS 10/11 OS                                   |
+---------------------------------------------------------------------------------------+
|                                  ELECTRON MAIN PROCESS                                |
|  +---------------------+   +---------------------+   +-----------------------------+  |
|  | Window & LifeCycle  |   | SQLite Storage DB   |   | Native Stockfish UCI Spawn  |  |
|  | - Frameless TitleBar|   | - better-sqlite3    |   | - child_process.spawn       |  |
|  | - Window state      |   | - JSON fallbacks    |   | - Process supervision       |  |
|  +----------+----------+   +----------+----------+   +--------------+--------------+  |
|             |                         |                             |                 |
|  +----------v-------------------------v-----------------------------v--------------+  |
|  |                    TYPE-SAFE IPC BRIDGE (Preload / ContextBridge)              |  |
|  |                    - contextIsolation: true                                     |  |
|  |                    - nodeIntegration: false                                     |  |
|  |                    - Strict Content-Security-Policy (CSP)                       |  |
|  +------------------------------------+--------------------------------------------+  |
+---------------------------------------|-----------------------------------------------+
                                        |
+---------------------------------------v-----------------------------------------------+
|                                  RENDERER PROCESS (Vite + React 19 + TypeScript)      |
|  +---------------------------------------------------------------------------------+  |
|  | Application Shell & Navigation (Persistent Left Rail, Modals, Views)            |  |
|  +---------------------------------------------------------------------------------+  |
|  | Core Modules:                                                                   |  |
|  | - Play Chess (Clocks, Human vs Engine, 2-Player, Custom FEN)                    |  |
|  | - Analysis Lab (Eval Graph, Move Classifier, Turning Point, Candidate Lines)   |  |
|  | - Grandmaster Coach (Positional Evaluation Heuristics, Threat Finder, Quizzes)  |  |
|  | - Academy (7 Curriculum Stages, Interactive Exercises, Mastery Checks)         |  |
|  | - Opening Lab (Encyclopedia, Move Tree, Repertoire Builder, Deviation Drill)   |  |
|  | - Tactics Gym (Verified Puzzles, 3-Tier Hints, Puzzle Rush, Spaced Repetition) |  |
|  | - Endgame Lab (Theoretical Drills, Lucena, Philidor, Fortresses)                |  |
|  | - Mistake Library (Automated Blunder Collector, "Stop Making This Mistake")     |  |
|  | - Game Library (Local PGN/FEN Database, Search, Filters, PGN Export)           |  |
|  | - Progress & Analytics (Accuracy, Tactical Success by Theme, Streaks)         |  |
|  | - Settings & Diagnostics (Themes, Board Styles, UCI Limits, Offline Audit)      |  |
|  +---------------------------------------------------------------------------------+  |
|  | Core Engine Services:                                                           |  |
|  | - chess.js Rules Engine (Validation, FEN/PGN parser, Draw rules, History)       |  |
|  | - Unified Engine Client (Dispatches to Native UCI via IPC or WebWorker WASM)   |  |
|  | - Web Audio Synthesizer (Move, Capture, Check, Victory acoustic feedback)      |  |
|  +---------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Process Architecture & IPC Bridge

### Main Process Responsibilities
1. **Window Management**: Native window creation, minimizing, maximizing, close events, window frame styling.
2. **UCI Subprocess Supervisor**:
   - Spawns Stockfish executable in background.
   - Pipes stdin / stdout with line-buffered stream parser.
   - Monitors health, detects non-responsive states, issues `stop`, or restarts process.
3. **Database Driver**:
   - Manages SQLite database located in `%APPDATA%/GrandmasterOS/grandmaster.db`.
   - Runs transactional queries for games, puzzle attempts, and profile states.
4. **Local File I/O**:
   - Native file dialogs for PGN and FEN importing and exporting.
   - Local profile backup archive generation (`.gmos-backup`).

### Context Isolation & Preload Security
- Preload script exposes a strictly typed `window.electronAPI`:
  - `engineCommand(cmd: string): Promise<void>`
  - `onEngineOutput(cb: (line: string) => void): () => void`
  - `saveGame(game: StoredGame): Promise<number>`
  - `loadGames(): Promise<StoredGame[]>`
  - `openFileDialog(): Promise<string | null>`
  - `saveFileDialog(defaultName: string, content: string): Promise<boolean>`
  - `getSystemMetrics(): Promise<{ cpuCount: number; memoryMB: number }>`
- No raw `child_process` or Node `fs` is exposed to the renderer context.

---

## 3. Stockfish Engine Management Layer

Grandmaster OS implements a dual-mode engine architecture:

### Mode A: Native UCI Subprocess (Primary on Desktop)
- Spawns local Stockfish binary via `child_process.spawn`.
- Standard UCI sequence:
  ```
  [UI -> Main]  "uci"
  [Engine]      "id name Stockfish ... uciok"
  [UI -> Main]  "setoption name Threads value 4"
  [UI -> Main]  "setoption name Hash value 256"
  [UI -> Main]  "isready"
  [Engine]      "readyok"
  [UI -> Main]  "position fen <FEN> moves <MOVES>"
  [UI -> Main]  "go depth 18 multipv 3"
  [Engine]      "info depth 18 score cp 45 multipv 1 pv e2e4 ..."
  [Engine]      "bestmove e2e4"
  ```
- Graceful cancellation: When user navigates or plays a move, `stop` is sent immediately. Obsolete results are ignored.

### Mode B: Stockfish WebAssembly Worker (Guaranteed Embedded Fallback)
- For zero-dependency installation where a native binary is not installed or detected, an embedded Stockfish WASM worker handles UCI messages in a background Web Worker thread.
- Ensures the application is 100% functional out of the box on any machine.

### Difficulty Modulation & Humanized Engine Opponent
To prevent lower levels from making absurd or random moves, the engine uses:
1. **UCI_LimitStrength** and **UCI_Elo** (from Elo 800 to 2850).
2. **Move Error Injection with Tactical Coherence**: When dialed to lower skill (e.g. Beginner ~1000 Elo), the engine selects suboptimal candidate moves (MultiPV 2 or 3) rather than illegal or completely random blunder sequences.

---

## 4. Local Grandmaster Coach Reasoning Architecture

The coach does not require an external Large Language Model or internet API. It operates via a multi-stage deterministic expert system:

```
+---------------------------------------------------------------------+
|                      POSITION ANALYSIS REQUEST                      |
+-----------------------------------+---------------------------------+
                                    |
            +-----------------------v-----------------------+
            |  Feature Extraction (chess.js + Heuristics)   |
            |  - Material balance & imbalances              |
            |  - King safety & pawn shields                 |
            |  - Piece mobility & active outpost control    |
            |  - Open files, half-open files, pawn levers   |
            |  - Tactical pins, forks, hanging pieces       |
            +-----------------------+-----------------------+
                                    |
            +-----------------------v-----------------------+
            |  Stockfish Multiline Engine Analysis          |
            |  - Top 3 candidate lines (MultiPV)            |
            |  - Centipawn evaluation shift (Delta eval)    |
            |  - Threat identification (Opponent's PV)      |
            +-----------------------+-----------------------+
                                    |
            +-----------------------v-----------------------+
            |  Diagnostic & Pedagogical Rule Engine         |
            |  - Identifies reason for delta eval           |
            |  - Classifies motif (e.g. "Overloaded Knight")|
            |  - Links concept to Academy curriculum        |
            +-----------------------+-----------------------+
                                    |
            +-----------------------v-----------------------+
            |  Explanation Synthesizer                      |
            |  - Structured 8-point explanation             |
            |  - Concrete PV illustration                   |
            |  - Socratic calculation quiz                  |
            +-----------------------------------------------+
```

---

## 5. Database Schema & Data Models

SQLite database (`grandmaster.db`) with normalized relations:

### 1. `profiles`
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT NOT NULL)
- `experience_level` (TEXT)
- `rating_estimate` (INTEGER)
- `notation_familiarity` (TEXT)
- `created_at` (TIMESTAMP)

### 2. `settings`
- `id` (INTEGER PRIMARY KEY)
- `board_theme` (TEXT DEFAULT 'wood')
- `piece_set` (TEXT DEFAULT 'classic')
- `sound_enabled` (INTEGER DEFAULT 1)
- `animation_speed` (TEXT DEFAULT 'normal')
- `engine_threads` (INTEGER DEFAULT 2)
- `engine_hash_mb` (INTEGER DEFAULT 128)
- `engine_depth_limit` (INTEGER DEFAULT 18)
- `coach_style` (TEXT DEFAULT 'tournament')
- `reduced_motion` (INTEGER DEFAULT 0)
- `theme_mode` (TEXT DEFAULT 'dark')

### 3. `games`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `white_name` (TEXT)
- `black_name` (TEXT)
- `result` (TEXT)
- `termination` (TEXT)
- `time_control` (TEXT)
- `initial_fen` (TEXT)
- `pgn` (TEXT)
- `played_at` (TIMESTAMP)
- `analysis_status` (TEXT DEFAULT 'pending')

### 4. `moves`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `game_id` (INTEGER REFERENCES games(id))
- `move_number` (INTEGER)
- `color` (TEXT)
- `san` (TEXT)
- `uci` (TEXT)
- `fen_before` (TEXT)
- `fen_after` (TEXT)
- `eval_cp` (INTEGER)
- `eval_mate` (INTEGER)
- `classification` (TEXT)
- `best_move` (TEXT)
- `clock_seconds` (REAL)

### 5. `puzzles` & `puzzle_attempts`
- Puzzle metadata: `fen`, `solution_moves`, `theme`, `rating`, `source`.
- Attempt record: `timestamp`, `solved` (0/1), `time_spent_ms`, `hints_used`, `reviewed_count`.

### 6. `mistake_positions`
- Captured from game analyses where move classification was `Mistake` or `Blunder`.
- Links to `game_id`, FEN, player move, best engine move, tactical theme, mastery status.

### 7. `review_schedule` (Spaced Repetition)
- Item type (`puzzle`, `mistake`, `repertoire_line`).
- Item ID, interval days, ease factor (SM-2), next_review_due date.

### 8. `lessons` & `lesson_progress`
- Academy stage, lesson ID, status (`locked`, `unlocked`, `completed`), score, completed_at.

---

## 6. Offline Security Perimeter

1. **Content Security Policy**:
   `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';`
2. **Network Sandbox**:
   - Zero outbound HTTP/HTTPS requests.
   - Zero WebSockets to external hosts.
   - Zero CDN script tags.
   - Zero third-party telemetry or crash-reporting libraries.
3. **Storage Security**:
   - Stored in standard Windows local application directory.
   - Plain SQLite and JSON structures allowing transparent user backups.
