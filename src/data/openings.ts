export interface OpeningVariation {
  name: string;
  eco: string;
  moves: string[]; // SAN sequence
  fen: string;
  category: 'Open Games (1.e4 e5)' | 'Sicilian Defense (1.e4 c5)' | 'Other 1.e4 Defenses' | 'Queen\'s Pawn (1.d4)' | 'Flank & Systems';
  plans: string;
  pawnStructure: string;
  tacticalMotifs: string;
  trapWarning?: string;
  modelLine: string;
}

export const OPENING_ENCYCLOPEDIA: OpeningVariation[] = [
  // OPEN GAMES (1.e4 e5)
  {
    name: 'Italian Game (Giuoco Piano)',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    category: 'Open Games (1.e4 e5)',
    plans: 'White aims for c3 and d4 to build a classic pawn center, rapid kingside castling, and targeting f7.',
    pawnStructure: 'Open or semi-open center with e4/d4 vs e5/d6 tension.',
    tacticalMotifs: 'Bxf7+ sacrifices, Ng5 pressure, pins along the a2-g8 diagonal.',
    trapWarning: 'Black must beware of early Ng5 attacks if f7 is inadequately defended.',
    modelLine: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2',
  },
  {
    name: 'Ruy Lopez (Spanish Opening)',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 3',
    category: 'Open Games (1.e4 e5)',
    plans: 'Pressure on Black\'s c6 knight defending e5. White prepares c3, d4, and Re1 with maneuver Nbd2-f1-g3.',
    pawnStructure: 'Complex closed center with Spanish pawn chain (White e4/d4/c3, Black e5/d6).',
    tacticalMotifs: 'Noah\'s Ark Trap (trapping White\'s light bishop on b3 with a6, b5, and c4).',
    trapWarning: 'White must ensure the b5/b3 bishop has an escape square against a6/b5/c4 advances.',
    modelLine: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3',
  },
  {
    name: 'Scotch Game',
    eco: 'C45',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4',
    category: 'Open Games (1.e4 e5)',
    plans: 'Immediate central liquidation by White to open files for bishops and rooks.',
    pawnStructure: 'White has a 4 vs 3 pawn majority on the kingside; Black has a 4 vs 3 on the queenside.',
    tacticalMotifs: 'Nxc6 bxc6 opening the b-file, Qf3 queen batteries.',
    modelLine: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nge7 7.Bc4',
  },
  {
    name: 'Petroff Defense (Russian Game)',
    eco: 'C42',
    moves: ['e4', 'e5', 'Nf3', 'Nf6'],
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    category: 'Open Games (1.e4 e5)',
    plans: 'Symmetrical counter-attack against White\'s e4 pawn instead of passively defending e5.',
    pawnStructure: 'Open e-file with early symmetrical pawn structures.',
    tacticalMotifs: 'Discovery on the open e-file if Black rushes Nxe4 before Qe2.',
    trapWarning: 'If White plays 3.Nxe5, Black must play 3...d6 before capturing on e4!',
    modelLine: '1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3 Bd6 7.O-O O-O',
  },

  // SICILIAN DEFENSE (1.e4 c5)
  {
    name: 'Sicilian Najdorf',
    eco: 'B90',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    category: 'Sicilian Defense (1.e4 c5)',
    plans: 'Black controls b5, prepares e5 or e6, and launches a queenside counter-attack along the half-open c-file.',
    pawnStructure: 'Asymmetrical: Black has two central pawns (d6/e5 or d6/e6) against White\'s single e4 pawn.',
    tacticalMotifs: 'Exchange sacrifices on c3 (Rxc3), d5 outpost battles, opposite-side castling storms.',
    modelLine: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e5 7.Nb3 Be6 8.f3 Be7 9.Qd2 O-O 10.O-O-O',
  },
  {
    name: 'Sicilian Dragon',
    eco: 'B70',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
    fen: 'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    category: 'Sicilian Defense (1.e4 c5)',
    plans: 'Fianchetto of the dark-squared bishop on g7, breathing fire down the long diagonal toward b2/a1.',
    pawnStructure: 'Dragon pawn structure with pawns on d6 and g6; half-open c-file for Black.',
    tacticalMotifs: 'Yugoslav Attack (Be3, f3, Qd2, O-O-O, g4, h4-h5, Bh6). Mate races on opposite wings.',
    modelLine: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 10.O-O-O',
  },
  {
    name: 'Sicilian Alapin (2.c3)',
    eco: 'B22',
    moves: ['e4', 'c5', 'c3'],
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2',
    category: 'Sicilian Defense (1.e4 c5)',
    plans: 'White establishes a broad pawn center with d4 without allowing open Sicilian tactical complications.',
    pawnStructure: 'White maintains a strong d4/e4 pawn center if Black permits.',
    tacticalMotifs: 'Isolated Queen Pawn (IQP) positions after Black plays d5 or Nf6.',
    modelLine: '1.e4 c5 2.c3 d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3 Bg4 6.Be2 e6 7.O-O Nc6 8.Be3 cxd4',
  },

  // OTHER 1.E4 DEFENSES
  {
    name: 'French Defense (Winawer & Classical)',
    eco: 'C00',
    moves: ['e4', 'e6', 'd4', 'd5'],
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    category: 'Other 1.e4 Defenses',
    plans: 'Solid counter-stroke against e4. Black attacks White\'s pawn chain base with c5 and f6.',
    pawnStructure: 'Closed center with locked pawns on e5 vs e6 and d4 vs d5. Black\'s light-squared bishop is restricted.',
    tacticalMotifs: 'Greek Gift sacrifice (Bxh7+), f-file infiltration, pawn breakthroughs with c5/f6.',
    modelLine: '1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3+ 6.bxc3 Ne7 7.Qg4',
  },
  {
    name: 'Caro-Kann Defense',
    eco: 'B12',
    moves: ['e4', 'c6', 'd4', 'd5'],
    fen: 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    category: 'Other 1.e4 Defenses',
    plans: 'Hyper-solid defense preparing d5 while keeping the c8-bishop free to develop to f5 or g4 before playing e6.',
    pawnStructure: 'Classical Capablanca structure: Black c6/e6 vs White e5/d4 or open d-file/e-file.',
    tacticalMotifs: 'Advance variation attacks, h4-h5 trapping Black\'s f5 bishop.',
    modelLine: '1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2 c5 6.Be3 Qb6 7.Nc3 Nc6 8.O-O',
  },

  // QUEEN\'S PAWN OPENINGS (1.d4)
  {
    name: 'Queen\'s Gambit Declined (QGD)',
    eco: 'D30',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'],
    fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 1 4',
    category: 'Queen\'s Pawn (1.d4)',
    plans: 'Black resolutely holds the d5 stronghold. White seeks minority attack with b4-b5 or e4 central break.',
    pawnStructure: 'Carlsbad structure (White c4xd5, Black e6xd5) giving White open c-file and Black open e-file.',
    tacticalMotifs: 'Pillsbury attack (Ne5, f4, Rf3-h3), minority attack on queenside pawns.',
    modelLine: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 Be7 6.e3 O-O 7.Bd3 Nbd7 8.Qc2 Re8 9.Nge2 Nf8',
  },
  {
    name: 'King\'s Indian Defense (KID)',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    fen: 'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP2BPPP/R1BQK1NR w KQ - 1 5',
    category: 'Queen\'s Pawn (1.d4)',
    plans: 'Black concedes central space early, fianchettoes the dark bishop, castles, and strikes with e5, followed by f5 kingside storm.',
    pawnStructure: 'Mar del Plata closed structure (White d5, c4, e4 vs Black d6, c7, e5). Mutual wing attacks.',
    tacticalMotifs: 'White attacks on the queenside (c5 break), while Black sacrifices pawns to mate on the kingside (g5, f4, g4).',
    modelLine: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Nd3 f5',
  },
  {
    name: 'London System',
    eco: 'D02',
    moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'],
    fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3',
    category: 'Queen\'s Pawn (1.d4)',
    plans: 'Solidity and low-risk setup. White develops the dark-squared bishop outside the pawn chain before playing e3, c3, and Nbd2.',
    pawnStructure: 'Solid pyramid pawn chain on c3-d4-e3.',
    tacticalMotifs: 'Ne5 knight outpost, Bd3 bishop battery aiming at h7, kingside attacking setups.',
    modelLine: '1.d4 d5 2.Nf3 Nf6 3.Bf4 c5 4.e3 Nc6 5.c3 Qb6 6.Qb3 c4 7.Qc2 Bf5 8.Qc1',
  },

  // FLANK & SYSTEMS
  {
    name: 'English Opening',
    eco: 'A10',
    moves: ['c4'],
    fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1',
    category: 'Flank & Systems',
    plans: 'White fights for d5 from the flank with c4, fianchettoes the king bishop (g3, Bg2), and keeps central flexibility.',
    pawnStructure: 'Reversed Sicilian or Botvinnik system (pawns on c4, d3, e4).',
    tacticalMotifs: 'Queenside expansion (Rb1, a3, b4), control of the dark squares.',
    modelLine: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.a3 O-O',
  },
];
