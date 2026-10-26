export interface TheoreticalEndgame {
  id: string;
  title: string;
  category: 'King & Pawn' | 'Rook Endings' | 'Minor Piece Endings' | 'Fundamental Checkmates';
  fen: string;
  sideToMove: 'w' | 'b';
  objective: 'win' | 'draw';
  keyMoves: string[]; // sequence of winning/drawing moves
  concept: string;
  technique: string;
  grandmasterTip: string;
}

export const THEORETICAL_ENDGAMES: TheoreticalEndgame[] = [
  {
    id: 'endgame_lucena',
    title: 'Lucena Position (Building the Bridge)',
    category: 'Rook Endings',
    fen: '1K1k4/1P1r4/8/8/8/8/8/R7 w - - 0 1',
    sideToMove: 'w',
    objective: 'win',
    keyMoves: ['Ra4', 'Ke7', 'Re4+', 'Kd6', 'Re8', 'Rd1', 'Kc8', 'Rc1+', 'Kd8'],
    concept:
      'The Lucena Position is the foundational winning technique in single-rook endgames when your pawn has reached the 7th rank and your king is in front of it.',
    technique:
      'The "Bridge Building" technique: 1. Place your rook on the 4th rank (Ra4). 2. Force the enemy king back with checks. 3. Step your king out, shielding it with the rook on the 4th rank when vertical checks come.',
    grandmasterTip:
      'Remember: The rook belongs on the 4th rank to block the checks at the exact moment your king emerges!',
  },
  {
    id: 'endgame_philidor',
    title: 'Philidor Position (3rd Rank Defense)',
    category: 'Rook Endings',
    fen: '4k3/8/8/8/4P3/8/4r3/4K1R1 b - - 0 1',
    sideToMove: 'b',
    objective: 'draw',
    keyMoves: ['Re3', 'Kd2', 'Re2+'],
    concept:
      'The most important drawing technique in rook endgames. The defending king stays on the promotion square, and the defending rook patrols the 3rd rank (6th for Black) to prevent the enemy king from advancing.',
    technique:
      'Wait on the 3rd rank with your rook until the enemy pawn advances to the 6th rank. The moment the pawn advances, immediately swing your rook to the 8th rank and deliver perpetual checks from behind!',
    grandmasterTip:
      'Never allow the attacking king to step in front of its pawn on the 6th rank before you move your rook to the rear.',
  },
  {
    id: 'endgame_opposition',
    title: 'Distant & Direct Opposition',
    category: 'King & Pawn',
    fen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',
    sideToMove: 'w',
    objective: 'win',
    keyMoves: ['Kd3', 'Kd5', 'e3'],
    concept:
      'Opposition dictates which King is forced to surrender key breakthrough squares. With King in front of the pawn, seizing the opposition guarantees promotion.',
    technique:
      'Advance the King, not the pawn! The King must lead the way and clear outposts on the 6th rank. Once the King reaches the 6th rank in front of its pawn, the pawn promotes regardless of who has the opposition.',
    grandmasterTip:
      'If your King reaches the 6th rank in front of its pawn, the position is ALWAYS won.',
  },
  {
    id: 'endgame_basic_rook_mate',
    title: 'Basic Checkmate: King and Rook vs King',
    category: 'Fundamental Checkmates',
    fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1',
    sideToMove: 'w',
    objective: 'win',
    keyMoves: ['Ra4', 'Kd5', 'Kd2', 'Ke5', 'Ke3'],
    concept:
      'Confining the lone enemy king into an ever-shrinking "box" and driving it to the edge of the board.',
    technique:
      'Use the Rook as a fence to cut off files/ranks, bring your King into opposition with the enemy King, and deliver waiting checks until checkmate is delivered on the board edge.',
    grandmasterTip:
      'Never stalemate! Keep checking that the lone king still has legal squares until the final mating blow.',
  },
  {
    id: 'endgame_opposite_bishops',
    title: 'Opposite-Colored Bishop Fortress',
    category: 'Minor Piece Endings',
    fen: '8/8/5k2/5p2/4b3/5K2/8/5B2 w - - 0 1',
    sideToMove: 'w',
    objective: 'draw',
    keyMoves: ['Ke3', 'Ke5', 'Be2'],
    concept:
      'Opposite-colored bishop endgames have tremendous drawing tendencies because the defending player controls the squares of their own color complex that the enemy bishop can never attack.',
    technique:
      'Place your bishop on the diagonal controlling the enemy passed pawn\'s path, block the king with your own king, and maintain an unbreakable blockade.',
    grandmasterTip:
      'Material down by 1 or 2 pawns is frequently drawn in opposite-colored bishop endgames if a light or dark square fortress is achieved.',
  },
];
