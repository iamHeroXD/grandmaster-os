# GRANDMASTER OS — COMPREHENSIVE TEST PLAN & ACCEPTANCE MATRIX

## 1. Test Strategy & Scope

This document defines the rigorous testing protocols required to ensure Grandmaster OS meets tournament-grade software quality standards, strict offline privacy compliance, and absolute chess rules precision.

Testing spans three tiers:
1. **Automated Unit Tests**: Chess rules, FEN/PGN parser, Stockfish UCI output parser, Move classification heuristics, Spaced-repetition math, Coach reasoning.
2. **Integration Tests**: Full end-to-end user journeys (Profile -> Lesson -> Puzzle -> Game -> Analysis -> Mistake Bank -> Persistence).
3. **Acceptance Test Matrix**: 25 explicit acceptance criteria mandated by the Grandmaster OS product specifications.

---

## 2. Acceptance Test Matrix (25 Mandated Criteria)

| # | Acceptance Criterion | Test Method | Expected Result | Pass Criteria |
|---|----------------------|-------------|-----------------|---------------|
| 1 | Legal opening sequence | Unit / Engine | 1.e4 e5 2.Nf3 Nc6 3.Bc4 executes | Legal board state, turn advances |
| 2 | Illegal moves rejected | Unit / Rules | Move e2-e5 on turn 1 rejected | Returns null / error; board state unchanged |
| 3 | Castling works correctly | Unit / Rules | O-O and O-O-O tested, including check restrictions | King and Rook move; illegal through check blocked |
| 4 | En passant works correctly | Unit / Rules | 1.e4 Nf6 2.e5 d5 3.exd6 executed | Black pawn removed, White pawn on d6 |
| 5 | Pawn promotion works correctly | Unit / Rules | Pawn on 7th rank promotes to Q, R, B, N | Target square occupied by chosen piece |
| 6 | Checkmate is detected | Unit / Rules | Scholar's mate (1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6 4.Qxf7#) | `isCheckmate() === true`, game ends |
| 7 | Stalemate is detected | Unit / Rules | Setup known stalemate FEN (e.g. 7k/5Q2/6K1/8/8/8/8/8 b - - 0 1) | `isStalemate() === true`, draw recorded |
| 8 | Draw conditions handled | Unit / Rules | 3-fold repetition, 50-move rule, insufficient material | Draw claim enabled or automatic termination |
| 9 | Game state save/restore | Integration | Save in-progress game, reload from DB | Position, clocks, move history exactly restored |
| 10 | PGN import/export | Integration | Export PGN, re-import into clean instance | Move sequence, FEN, header tags 100% identical |
| 11 | FEN positions load and validate | Unit / Rules | Load valid FENs; reject illegal FENs (e.g. 2 kings) | Valid loads cleanly; invalid gives descriptive error |
| 12 | UCI engine starts & moves | Engine test | Send `uci`, `isready`, `position`, `go depth 5` | Returns `uciok`, `readyok`, legal `bestmove` |
| 13 | Engine search stopped | Engine test | Issue `go infinite`, then `stop` | Engine emits `bestmove` and halts calculation |
| 14 | Engine failure handled gracefully | Engine test | Simulate engine exit/crash | UI displays diagnostic notice, auto-restarts worker |
| 15 | Analysis tied to correct positions| Engine / UI | Run game analysis on 10-move game | Move N evaluation correlates to FEN after move N |
| 16 | Game review produces feedback | Coach / Analysis| Run review on game containing blunder | Identifies mistake, delta centipawns, better candidate |
| 17 | Lessons record actual progress | Academy / DB | Complete Lesson 1 exercise | Lesson status marked completed in local DB |
| 18 | Puzzle solutions validated | Tactics / DB | Solve puzzle with right move; test wrong move | Correct advances puzzle; incorrect flags error & retry |
| 19 | Repertoire training validation | Opening / Repertoire | Play line according to repertoire vs deviation | Match accepted; deviation triggers coaching explanation |
| 20 | Review scheduling persists | Spaced Repetition| Fail puzzle -> check review schedule -> restart app | Due date persists in SQLite across restarts |
| 21 | Works without internet | Security / Network | Run test suite with networking disabled | All 12 modules function with zero network errors |
| 22 | No external user data leak | Security / Network | Intercept network sockets during full app run | 0 outbound HTTP/HTTPS packets detected |
| 23 | Fresh install contains no fake data| DB / Profile | Inspect fresh DB tables (`games`, `puzzle_attempts`)| Exactly 0 games, 0 attempts, unpolluted stats |
| 24 | Backup and restore work | Storage / DB | Export `.gmos-backup`, wipe data, restore | All profiles, games, and progress recovered |
| 25 | Destructive reset confirmation | UI / Security | Click "Reset All Data" | Modal requires explicit confirmation before wipe |

---

## 3. End-to-End Workflow Integration Test

A comprehensive scenario verifying the entire core lifecycle:
1. **First Launch**: Fresh state, First-Run Setup modal appears.
2. **Profile Creation**: Enter username "CandidateMaster", select "Intermediate", save.
3. **Complete Lesson**: Navigate to Academy -> Stage 1: Foundations -> Lesson: Castling -> Solve exercise -> Verify completion recorded.
4. **Solve Puzzle**: Navigate to Tactics -> Daily Tactics -> Solve Pin puzzle -> Verify attempt saved.
5. **Play Game**: Play 4 moves vs Stockfish -> Resign -> Verify game saved in Game Library.
6. **Analyze Game**: Run Analysis Lab -> View evaluation graph, move classifications, turning points.
7. **Mistake Review**: Blunder automatically captured into "My Mistakes" -> Replay position.
8. **Spaced Repetition**: Verify next review date computed.
9. **Persistence Check**: Restart session -> Verify profile, lesson status, puzzle score, and game history persist identically.

---

## 4. Test Execution & Reporting

All unit and integration tests are executable via standard command line:
```bash
npm run test
```
The test suite outputs a deterministic report detailing every rule test, UCI handshake, and security assertion.
