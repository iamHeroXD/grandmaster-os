import { LessonContent } from '../types/database';

export const ACADEMY_LESSONS: LessonContent[] = [
  // STAGE 1: FOUNDATIONS
  {
    id: 'stage1_coordinates',
    stageNumber: 1,
    stageTitle: 'Foundations of Chess',
    title: 'The Chessboard & Board Coordinates',
    summary: 'Master files (a-h), ranks (1-8), diagonals, and algebraic notation.',
    concept:
      'Every square on the board has a unique address determined by its file (column a through h) and rank (row 1 through 8). White sets up on ranks 1 and 2, while Black sets up on ranks 7 and 8. "White on right": the bottom-right corner must always be a light square (h1 for White).',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    interactiveMovePrompt: 'Play the classic opening move moving your King pawn two squares to e4.',
    expectedMove: 'e4',
    explanationOnCorrect:
      'Excellent! e4 stakes an immediate claim in the center, controls d5 and f5, and frees your light-squared bishop and queen for development.',
    commonMistake: 'Pushing flank pawns like a4 or h4 early on without fighting for central control.',
    masteryQuizFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    masteryQuizExpectedMove: 'e5',
  },
  {
    id: 'stage1_check_vs_mate',
    stageNumber: 1,
    stageTitle: 'Foundations of Chess',
    title: 'Check vs. Checkmate vs. Stalemate',
    summary: 'Understand when a King is attacked, when the game is won, and when it is drawn.',
    concept:
      'Check occurs when the King is under direct attack. The defending player MUST escape check by one of three methods (CPR: Capture the attacker, Protect by blocking with another piece, or Run with the King). Checkmate occurs when the King is in check and has NO legal escape. Stalemate occurs when a player has NO legal moves, but their King is NOT in check—this results in an immediate draw!',
    initialFen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    interactiveMovePrompt: 'Find the decisive blow: deliver Scholar\'s Checkmate with Qxf7#.',
    expectedMove: 'Qxf7#',
    explanationOnCorrect:
      'Checkmate! The Queen attacks the King on f7, guarded by the bishop on c4. The King cannot capture the Queen (guarded), cannot block (adjacent attack), and has no escape squares.',
    commonMistake: 'Failing to realize f7 (and f2 for White) is the weakest square in the starting position because only the King defends it.',
  },
  {
    id: 'stage1_castling',
    stageNumber: 1,
    stageTitle: 'Foundations of Chess',
    title: 'King Safety & Castling Rules',
    summary: 'Tuck your King behind a wall of pawns and activate your Rook in a single move.',
    concept:
      'Castling is the only move in chess where two pieces move simultaneously. Kingside castling (O-O) moves the King two squares toward the h-file and hops the rook to f1. Queenside castling (O-O-O) moves the King two squares toward the a-file and hops the rook to d1. Rules: neither piece may have moved, no pieces between them, and the King cannot castle out of check, through check, or into check.',
    initialFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 1 5',
    interactiveMovePrompt: 'Castle kingside (O-O) to secure your King and activate the f1-rook.',
    expectedMove: 'O-O',
    explanationOnCorrect:
      'Splendid! Your King is shielded behind the f2, g2, and h2 pawns, and your h1-rook is transferred toward the critical central files.',
    commonMistake: 'Leaving the King in the center too long, allowing open files to expose it to lethal tactics.',
  },

  // STAGE 2: BEGINNER TACTICS
  {
    id: 'stage2_forks',
    stageNumber: 2,
    stageTitle: 'Beginner Tactics',
    title: 'The Knight & Pawn Fork',
    summary: 'Attack two enemy pieces simultaneously with a single move.',
    concept:
      'A fork occurs when a single piece attacks two or more enemy targets at the same time. Knights are notorious for geometric forks because their leaping moves cannot be blocked. Pawns also deliver deadly forks between minor pieces.',
    initialFen: 'r1bqk2r/pppp1ppp/8/4n3/2B1P3/2N5/PPP2PPP/R1BQK2R w KQkq - 0 7',
    interactiveMovePrompt: 'White has a tactical strike. Play Bxf7+ or fork if Black misplays, or find the fork.',
    expectedMove: 'Bxf7+',
    explanationOnCorrect:
      'Brilliant calculation! A classic tactical shot that strips King defenses and wins back material with interest.',
    commonMistake: 'Forgetting that Knights jump over pieces and can land on squares that attack both King and Queen.',
  },
  {
    id: 'stage2_pins',
    stageNumber: 2,
    stageTitle: 'Beginner Tactics',
    title: 'The Deadly Pin & Skewer',
    summary: 'Immobilize enemy pieces along files, ranks, and diagonals.',
    concept:
      'An absolute pin occurs when a piece cannot move because doing so would expose the King to check (illegal). A relative pin occurs when moving would lose a more valuable piece like a Queen. The golden rule: Attack the pinned piece with pawns and less valuable pieces!',
    initialFen: 'r1b1k2r/pppp1ppp/2n5/4p3/1bB1P3/5N2/PPPP1PPP/R1BQK2R w KQkq - 2 6',
    interactiveMovePrompt: 'Black has pinned your knight on c3 or threatened. Respond with c3 or d3.',
    expectedMove: 'c3',
    explanationOnCorrect:
      'Strong move! Challenging the pinned or pinning bishop immediately questions its presence on the board.',
    commonMistake: 'Defending a pinned piece instead of counter-attacking or ignoring the pressure until the piece is captured.',
  },
  {
    id: 'stage2_back_rank',
    stageNumber: 2,
    stageTitle: 'Beginner Tactics',
    title: 'The Back-Rank Weakness',
    summary: 'Punish a King trapped behind its own defensive pawn shield.',
    concept:
      'When a castled King has pawns on f7, g7, and h7 (or f2, g2, h2) and has not created "Luft" (escape air like h3 or h6), a heavy piece (Rook or Queen) infiltrating the 8th rank delivers an instant checkmate.',
    initialFen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    interactiveMovePrompt: 'Exploit Black\'s back-rank vulnerability and deliver checkmate.',
    expectedMove: 'Re8#',
    explanationOnCorrect:
      'Checkmate! The Black King has no escape squares because its own pawns on f7, g7, and h7 block all flight paths.',
    commonMistake: 'Forgetting to push a rook pawn (creating Luft) in rook endgames to avoid sudden back-rank disasters.',
  },

  // STAGE 3: ESSENTIAL STRATEGY
  {
    id: 'stage3_outposts',
    stageNumber: 3,
    stageTitle: 'Essential Strategy',
    title: 'Knight Outposts & Weak Squares',
    summary: 'Establish permanent forward footholds protected by pawns.',
    concept:
      'An outpost is a square (usually on the 4th, 5th, or 6th rank) that cannot be attacked by an enemy pawn. A knight placed on a supported central outpost dominates the board, paralyzes enemy pieces, and coordinates attacks.',
    initialFen: 'r2q1rk1/pp1b1ppp/2n1pn2/3p4/2PP4/1PN1PN2/3B1PPP/R2QKB1R w KQ - 1 9',
    interactiveMovePrompt: 'Stake out your central presence and open lines with c5 or play Ne5.',
    expectedMove: 'c5',
    explanationOnCorrect:
      'Positional mastery! Seizing queenside space, restricting Black\'s bishop, and establishing central pawn dominance.',
    commonMistake: 'Allowing the opponent to trade off an active outpost piece without gaining compensation.',
  },

  // STAGE 4: INTERMEDIATE CALCULATION
  {
    id: 'stage4_candidate_moves',
    stageNumber: 4,
    stageTitle: 'Intermediate Calculation',
    title: 'Candidate Moves & Kotov\'s Calculation Tree',
    summary: 'Structure your thinking: Checks, Captures, Threats (CCT).',
    concept:
      'Alexander Kotov taught that grandmasters do not calculate random moves; they systematically brainstorm 2-4 candidate moves first, calculate each branch without jumping back and forth, and then decide. Always calculate forcing moves first!',
    initialFen: 'r2q1rk1/1pp2ppp/p1np1n2/4p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8',
    interactiveMovePrompt: 'Spot the forcing candidate move: play Nd5, exerting severe pressure on the pinned knight.',
    expectedMove: 'Nd5',
    explanationOnCorrect:
      'Exceptional candidate move! Putting direct pressure on the pinned f6 knight. Black is forced to reckon with Nxf6+ creating doubled pawns or losing the queen.',
    commonMistake: 'Calculating one tempting move deeply without noticing a simpler, more forcing alternative.',
  },

  // STAGE 5: ADVANCED MIDDLEGAME
  {
    id: 'stage5_pawn_breaks',
    stageNumber: 5,
    stageTitle: 'Advanced Middlegame',
    title: 'Pawn Breaks & Structure Dynamics',
    summary: 'Unlock closed positions and shatter enemy fortresses with decisive pawn breaks.',
    concept:
      'Pawns are the soul of chess (Philidor). In closed positions with locked pawn chains, games are decided by pawn breaks—levering open files for your rooks and creating outposts for your pieces.',
    initialFen: 'rnbq1rk1/pp1nppbp/3p2p1/2pP4/2P1P3/2N2N2/PP2BPPP/R1BQK2R w KQ - 1 8',
    interactiveMovePrompt: 'Prepare or push your central break with e4-e5 or play O-O first.',
    expectedMove: 'O-O',
    explanationOnCorrect:
      'Sound strategy! Safeguarding your King before igniting the central fireworks.',
    commonMistake: 'Opening the center while your own King is still stuck uncastled.',
  },

  // STAGE 6: PRACTICAL ENDGAMES
  {
    id: 'stage6_opposition',
    stageNumber: 6,
    stageTitle: 'Practical Endgames',
    title: 'King Opposition in Pawn Endgames',
    summary: 'The fundamental geometry of King and Pawn endings.',
    concept:
      'The Opposition occurs when Kings face each other on the same rank, file, or diagonal with one square between them. The player NOT having to move "has the opposition" and controls the critical breakthrough squares.',
    initialFen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',
    interactiveMovePrompt: 'Take the direct opposition with Kd3, forcing the Black king to yield.',
    expectedMove: 'Kd3',
    explanationOnCorrect:
      'Perfect! You take the opposition. Black\'s King must step aside (to d5 or f5), allowing your King to advance and escort the e-pawn to promotion.',
    commonMistake: 'Advancing the pawn too early before using the King to clear the path and seize the key squares.',
  },

  // STAGE 7: COMPETITIVE MASTERY
  {
    id: 'stage7_time_management',
    stageNumber: 7,
    stageTitle: 'Competitive Mastery',
    title: 'Practical Clock & Tournament Psychology',
    summary: 'Calculate when it matters, play solidly when pressed, and avoid time trouble.',
    concept:
      'Tournament games are won not by the best moves in the abstract, but by the best practical moves under time constraints. Allocate 60% of your time to critical positions (pawn breaks, tactical strikes, King assaults) and play standard developing moves rhythmically.',
    initialFen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 5',
    interactiveMovePrompt: 'Kick the intrusive bishop with d4 or secure center with d3.',
    expectedMove: 'd4',
    explanationOnCorrect:
      'Decisive strike! Striking the center immediately, utilizing your development advantage.',
    commonMistake: 'Spending 5 minutes on an obvious recapture or opening book move.',
  },
];
