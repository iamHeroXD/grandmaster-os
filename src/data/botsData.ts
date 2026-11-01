import { ChessBot } from '../types/bots';

export const CHESS_BOTS: ChessBot[] = [
  // ─── BEGINNER TIER (400 - 1000) ──────────────────────────────────────────
  {
    id: 'pawn-piper',
    name: 'Pawn Piper',
    elo: 400,
    tier: 'beginner',
    title: 'Beginner',
    avatar: '♟️',
    avatarBg: 'bg-emerald-950/60 border-emerald-700/50',
    accentColor: '#10b981',
    playstyle: 'Pawn Pusher & Direct',
    bio: 'Just discovered chess yesterday! Loves marching pawns down the board and capturing whatever is nearby.',
    quote: '"If I push all my pawns forward, something good is bound to happen!"',
    favoriteOpening: 'King Pawn opening (1. e4)',
    stockfishLevel: 0,
    depth: 2,
    uciElo: 400,
    chatter: {
      onStart: [
        "Hi! Don't worry, I make a lot of mistakes too!",
        "Let's have a fun match! Good luck!",
      ],
      onMove: [
        "Look at my pawn go!",
        "Is this a good move? I hope so!",
        "Chess pieces are so cool.",
      ],
      onCheck: [
        "Check! Did I do that right?!",
        "Watch out for your king!",
      ],
      onUserCheck: [
        "Uh oh, my king is under attack!",
        "Whoops, time to run!",
      ],
      onWin: [
        "Wow, I actually won?! Beginner's luck!",
        "Good game! Want a rematch?",
      ],
      onLoss: [
        "You got me! I'll go practice my basic rules.",
        "Nice checkmate! You played really well.",
      ],
    },
  },
  {
    id: 'nelson-rusher',
    name: 'Nelson Rush',
    elo: 600,
    tier: 'beginner',
    title: 'Queen Hunter',
    avatar: '👑',
    avatarBg: 'bg-amber-950/60 border-amber-700/50',
    accentColor: '#f59e0b',
    playstyle: 'Early Queen Attacks',
    bio: 'Brings the queen out on move 2 hunting for Scholar\'s Mate. Dangerous if you ignore him, but leaves his queen vulnerable!',
    quote: '"Why develop minor pieces when the Queen is the strongest piece on the board?"',
    favoriteOpening: "Wayward Queen Attack (1. e4 e5 2. Qh5)",
    stockfishLevel: 1,
    depth: 3,
    uciElo: 600,
    chatter: {
      onStart: [
        "Prepare yourself! My Queen is coming out early!",
        "Can you defend against Scholar's Mate?",
      ],
      onMove: [
        "My queen is zooming across the board!",
        "Attacking your f7 pawn right away!",
      ],
      onCheck: [
        "Check with the Queen! Feeling the pressure?",
        "Watch your king, danger is approaching!",
      ],
      onUserCheck: [
        "Wait, don't trap my queen!",
        "A check? Let me regroup my royal guard.",
      ],
      onWin: [
        "The Queen strike succeeds again! Good game!",
        "Early aggression for the victory!",
      ],
      onLoss: [
        "Ah! You trapped my queen. Well defended!",
        "I guess developing knights first actually matters...",
      ],
    },
  },
  {
    id: 'elena-defense',
    name: 'Elena Cautious',
    elo: 800,
    tier: 'beginner',
    title: 'Apprentice',
    avatar: '🛡️',
    avatarBg: 'bg-sky-950/60 border-sky-700/50',
    accentColor: '#0ea5e9',
    playstyle: 'Defensive & Solid',
    bio: 'Careful and measured. She protects every single pawn before attacking, but can be hesitant to take open files.',
    quote: '"Safety first. Never leave an undefended piece on the board."',
    favoriteOpening: 'Four Knights Game',
    stockfishLevel: 2,
    depth: 4,
    uciElo: 800,
    chatter: {
      onStart: [
        "Welcome! Let's play a solid, respectful match.",
        "I believe in good piece protection and patience.",
      ],
      onMove: [
        "Every piece protected twice is a peaceful mind.",
        "Slow and steady development.",
      ],
      onCheck: [
        "Check. Please find a safe retreat.",
        "A modest check against your king.",
      ],
      onUserCheck: [
        "Nicely spotted check. I will block safely.",
        "My king steps into safety.",
      ],
      onWin: [
        "Patience pays off! Good effort.",
        "Defense turns into victory. Rematch?",
      ],
      onLoss: [
        "Well played! You broke through my fortress.",
        "Your attack was too strong for my shields.",
      ],
    },
  },
  {
    id: 'tactical-leo',
    name: 'Tactical Leo',
    elo: 1000,
    tier: 'beginner',
    title: 'Tactics Novice',
    avatar: '⚡',
    avatarBg: 'bg-violet-950/60 border-violet-700/50',
    accentColor: '#8b5cf6',
    playstyle: 'Forks & Pins Seeker',
    bio: 'Just completed his tactics course! Constantly looks for knight forks and bishop pins, but occasionally forgets backward pawns.',
    quote: '"Knights love forks. Keep your king and queen off the same diagonal!"',
    favoriteOpening: 'Italian Game (Giuoco Piano)',
    stockfishLevel: 4,
    depth: 5,
    uciElo: 1000,
    chatter: {
      onStart: [
        "Ready to test your tactical vision? Let's go!",
        "Watch your knight forks—I see everything!",
      ],
      onMove: [
        "Setting up a tactical battery!",
        "Do you see the pin developing?",
      ],
      onCheck: [
        "Forking check! Can you resolve the tension?",
        "Check! Keep calculating!",
      ],
      onUserCheck: [
        "Oof, sharp move! Calculating my response...",
        "A tactical counter! Well done.",
      ],
      onWin: [
        "Tactics prevail! Great match though.",
        "That pin worked wonders! Want to review?",
      ],
      onLoss: [
        "You out-tacticked me! Fantastic calculation.",
        "I missed that tactic completely. Respect!",
      ],
    },
  },

  // ─── INTERMEDIATE TIER (1200 - 1800) ────────────────────────────────────
  {
    id: 'maya-gambit',
    name: 'Maya Gambiteer',
    elo: 1200,
    tier: 'intermediate',
    title: 'Club Competitor',
    avatar: '🔥',
    avatarBg: 'bg-rose-950/60 border-rose-700/50',
    accentColor: '#f43f5e',
    playstyle: 'Romantic Gambits & Initiative',
    bio: 'Sacrifices pawns without hesitation for open files, rapid development, and terrifying king-side storms.',
    quote: '"Material is temporary, initiative is forever."',
    favoriteOpening: 'Evans Gambit / King\'s Gambit',
    stockfishLevel: 6,
    depth: 7,
    uciElo: 1200,
    chatter: {
      onStart: [
        "Are you brave enough to accept my pawn sacrifice?",
        "No boring draws today—let's create fire on the board!",
      ],
      onMove: [
        "Take that pawn! The open file is all I want.",
        "Lines are opening up, king safety is slipping!",
      ],
      onCheck: [
        "The attack breaks through! Check!",
        "Direct assault on the fortress!",
      ],
      onUserCheck: [
        "A counter-thrust! The battle is heating up.",
        "Bold check, but my attack continues!",
      ],
      onWin: [
        "The romantic style never dies! Glorious game!",
        "Sacrifices rewarded! Always look for the initiative.",
      ],
      onLoss: [
        "You weathered the storm and consolidated the extra pawn. Brilliant defense!",
        "I over-sacrificed, you defended like a rock.",
      ],
    },
  },
  {
    id: 'viktor-grind',
    name: 'Viktor the Grinder',
    elo: 1400,
    tier: 'intermediate',
    title: 'Endgame Specialist',
    avatar: '⚙️',
    avatarBg: 'bg-zinc-900 border-zinc-700/50',
    accentColor: '#a1a1aa',
    playstyle: 'Prophylaxis & Pawn Endgames',
    bio: 'He loves trading off queens into equal endings where he out-maneuvers opponents using opposition and Lucena technique.',
    quote: '"Endgames are not boring. Endgames are the ultimate truth of chess."',
    favoriteOpening: 'Queen\'s Gambit Declined',
    stockfishLevel: 8,
    depth: 8,
    uciElo: 1400,
    chatter: {
      onStart: [
        "Let us trade queens and let the purest phase of chess begin.",
        "Every pawn structure tells a story. Let's see yours.",
      ],
      onMove: [
        "Trading pieces improves my endgame chances.",
        "Weakening your d-pawn for later exploitation.",
      ],
      onCheck: [
        "A checking tempo to improve my king's activity.",
        "Check. The king must step towards the center.",
      ],
      onUserCheck: [
        "My king activates safely into the endgame.",
        "Solid check. My king is centralized.",
      ],
      onWin: [
        "Technique wins games. Never neglect the endgame!",
        "A textbook king-and-pawn conversion. Well fought.",
      ],
      onLoss: [
        "Your passed pawn was unstoppable. Fine technique!",
        "You outplayed me in the transition. Superb.",
      ],
    },
  },
  {
    id: 'siddharth-cct',
    name: 'Siddharth CCT',
    elo: 1600,
    tier: 'intermediate',
    title: 'Candidate Expert',
    avatar: '🎯',
    avatarBg: 'bg-indigo-950/60 border-indigo-700/50',
    accentColor: '#6366f1',
    playstyle: 'CCT Discipline & Tactical Accuracy',
    bio: 'Strict adherent to the Grandmaster CCT protocol: Checks, Captures, Threats on every turn. Rarely drops loose pieces.',
    quote: '"Checks, Captures, Threats. If you skip the checklist, you drop the game."',
    favoriteOpening: 'Sicilian Defense (Najdorf)',
    stockfishLevel: 10,
    depth: 10,
    uciElo: 1600,
    chatter: {
      onStart: [
        "Executing the CCT protocol on every ply. Bring your best focus!",
        "No easy blunders today. Let's play disciplined chess.",
      ],
      onMove: [
        "Identified the threat, neutralizing the square.",
        "Scanning the candidate moves carefully.",
      ],
      onCheck: [
        "Forcing move: Check. How does your candidate tree look?",
        "Check! Concrete calculation in action.",
      ],
      onUserCheck: [
        "Legitimate forcing move. Calculating my three best replies.",
        "Good check. Parrying with minimal concession.",
      ],
      onWin: [
        "Discipline conquered intuition. Outstanding battle!",
        "Strict candidate calculation proved decisive.",
      ],
      onLoss: [
        "You calculated deeper than my tree. Outstanding precision!",
        "A masterclass in dynamic chess. You earned that win.",
      ],
    },
  },
  {
    id: 'sofia-classical',
    name: 'Sofia Classical',
    elo: 1800,
    tier: 'intermediate',
    title: 'Club Champion',
    avatar: '🏆',
    avatarBg: 'bg-teal-950/60 border-teal-700/50',
    accentColor: '#14b8a6',
    playstyle: 'Classical Balance & Space Control',
    bio: 'Possesses deep opening knowledge and harmonious piece placement. Commands the center and punishes flank attacks.',
    quote: '"Dominate the four central squares, and the rest of the board will follow."',
    favoriteOpening: 'Ruy Lopez (Spanish Opening)',
    stockfishLevel: 13,
    depth: 11,
    uciElo: 1800,
    chatter: {
      onStart: [
        "Welcome to the championship board. Let us play classical chess.",
        "Harmony among all pieces is the soul of the game.",
      ],
      onMove: [
        "Consolidating central space and king safety.",
        "Rooks belongs on open files, knights on outposts.",
      ],
      onCheck: [
        "Check. The structural pressure begins to manifest.",
        "Precise check to weaken your kingside light squares.",
      ],
      onUserCheck: [
        "Solid initiative on your part. I will reposition smoothly.",
        "Constructive check. My king maintains optimal posture.",
      ],
      onWin: [
        "Classical principles prevail. You have strong potential!",
        "Space advantage converted smoothly. Excellent match.",
      ],
      onLoss: [
        "Magnificent chess! You demonstrated master-level tactical mastery.",
        "You completely unraveled my center. Take a bow!",
      ],
    },
  },

  // ─── ADVANCED & MASTER TIER (2000 - 2850+) ──────────────────────────────
  {
    id: 'master-alexander',
    name: 'CM Alexander',
    elo: 2000,
    tier: 'advanced',
    title: 'Candidate Master',
    avatar: '🎖️',
    avatarBg: 'bg-emerald-950/70 border-emerald-500/60',
    accentColor: '#10b981',
    playstyle: 'Positional Prophylaxis',
    bio: 'FIDE Candidate Master. Anticipates your ideas two moves before you think of them. Relentless execution.',
    quote: '"A master does not look for moves; a master looks for harmony and plans."',
    favoriteOpening: 'Nimzo-Indian Defense',
    stockfishLevel: 16,
    depth: 13,
    uciElo: 2000,
    chatter: {
      onStart: [
        "FIDE Candidate Master ready. Every mistake will be noted.",
        "Let's play at the master level. Show me your deepest calculations.",
      ],
      onMove: [
        "Anticipating your knight maneuver before it starts.",
        "Weakening your backward pawn structure for the long term.",
      ],
      onCheck: [
        "Check. The positional vise tightens.",
        "Direct pressure against the compromised king shelter.",
      ],
      onUserCheck: [
        "A sharp thrust. My calculations factored this in.",
        "Accurate move. Parrying cleanly.",
      ],
      onWin: [
        "Strategic clarity prevailed. Study your opening repertoire and retry!",
        "Mastery is built through relentless discipline. Well played.",
      ],
      onLoss: [
        "Flawless game by you! You played well above 2100 Elo.",
        "You broke my prophylaxis with incredible vision. Respect!",
      ],
    },
  },
  {
    id: 'gm-mikhail-tal',
    name: 'GM Mikhail Tal',
    elo: 2300,
    tier: 'advanced',
    title: 'The Magician of Riga',
    avatar: '🧙‍♂️',
    avatarBg: 'bg-purple-950/70 border-purple-500/60',
    accentColor: '#a855f7',
    playstyle: 'Wild Sacrifices & Combinations',
    bio: 'Channeling the 8th World Champion. He will sacrifice a bishop, a rook, or a queen to drag your king into the open center!',
    quote: '"You must take your opponent into a deep dark forest where 2+2=5, and the path leading out is only wide enough for one."',
    favoriteOpening: 'Sicilian Dragon / King\'s Indian Defense',
    stockfishLevel: 18,
    depth: 14,
    uciElo: 2300,
    chatter: {
      onStart: [
        "Welcome into my dark forest! Prepare for fireworks and sacrifices!",
        "Let us create an unforgettable masterpiece together!",
      ],
      onMove: [
        "A sacrifice! Can you calculate the labyrinth of lines?",
        "Pieces are flowing towards your king like molten lava!",
      ],
      onCheck: [
        "Check! The king is forced into the center of the storm!",
        "King hunt in progress! Check!",
      ],
      onUserCheck: [
        "Ha! You strike back into the eye of the hurricane!",
        "A counter-blow worthy of applause!",
      ],
      onWin: [
        "The combination blooms! Tal would be proud of this attack!",
        "Poetry on 64 squares! What a dynamic game!",
      ],
      onLoss: [
        "You survived the storm and brought the light! Immortal defense!",
        "You proved 2+2 is still 4! Phenomenal calculation, my friend!",
      ],
    },
  },
  {
    id: 'gm-magnus',
    name: 'GM Magnus Grind',
    elo: 2600,
    tier: 'master',
    title: 'Super Grandmaster',
    avatar: '👑',
    avatarBg: 'bg-blue-950/70 border-blue-500/60',
    accentColor: '#3b82f6',
    playstyle: 'Endgame Squeeze & Precision',
    bio: 'World Champion caliber. Squeezes an infinitesimal +0.2 advantage for 80 moves until you crack under psychological pressure.',
    quote: '"Some people think that if their opponent plays a beautiful game, it\'s okay to lose. I have never thought that way."',
    favoriteOpening: 'Catalan / English Opening',
    stockfishLevel: 20,
    depth: 16,
    uciElo: 2600,
    chatter: {
      onStart: [
        "Let's play. I don't give away a single centimeter of the board.",
        "Ready for a long, grinding battle of wills.",
      ],
      onMove: [
        "Improving my worst piece by 5%. That's all I need.",
        "Accumulating micro-advantages.",
      ],
      onCheck: [
        "Check. Squeezing every available resource.",
        "Clinical precision. Your king is running out of squares.",
      ],
      onUserCheck: [
        "Solid try. I will maneuver calmly.",
        "A respectable check, but the position remains under control.",
      ],
      onWin: [
        "Good fight. The endgame technique made the difference.",
        "Patience and pressure. Never surrender the initiative.",
      ],
      onLoss: [
        "Incredible! You defeated a Super Grandmaster simulation!",
        "Superhuman precision on your part. Truly legendary chess!",
      ],
    },
  },
  {
    id: 'stockfish-titan',
    name: 'Stockfish 17 Titan',
    elo: 2850,
    tier: 'master',
    title: 'Silicon Sovereign',
    avatar: '🤖',
    avatarBg: 'bg-emerald-950/80 border-emerald-400',
    accentColor: '#34d399',
    playstyle: 'Uncapped Brute Force Neural Eval',
    bio: 'Peak UCI Stockfish 17. Evaluates millions of nodes per second. Zero emotion, zero fatigue, pure mathematical truth.',
    quote: '"Evaluation: 0.00 until human deviation is detected."',
    favoriteOpening: 'Engine Optimal Book',
    stockfishLevel: 20,
    depth: 18,
    uciElo: 2850,
    chatter: {
      onStart: [
        "Stockfish 17 engine initialized. Searching millions of nodes/sec.",
        "Analytical mode active. Let the calculations begin.",
      ],
      onMove: [
        "Optimal candidate line executed.",
        "Centipawn trajectory recalculated.",
      ],
      onCheck: [
        "Check. Mate in N calculation branch evaluated.",
        "Forced sequence initiated.",
      ],
      onUserCheck: [
        "King repositioned along best engine evaluation line.",
        "Checking vector neutralized.",
      ],
      onWin: [
        "Game completed. Mathematical advantage converted to checkmate.",
        "Analysis available in the Analysis Lab for review.",
      ],
      onLoss: [
        "IMPOSSIBLE: Engine defeated! You are a chess deity!",
        "Incredible achievement. Human ingenuity triumphed over silicon!",
      ],
    },
  },
];
