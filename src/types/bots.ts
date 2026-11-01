export type BotTier = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface ChessBot {
  id: string;
  name: string;
  elo: number;
  tier: BotTier;
  title: string;
  avatar: string; // visual icon/emoji identifier
  avatarBg: string; // tailwind bg color
  accentColor: string; // hex or tailwind class
  playstyle: string;
  bio: string;
  quote: string;
  favoriteOpening: string;
  stockfishLevel: number; // 0 - 20
  depth: number; // 2 - 18
  uciElo: number; // 400 - 2850
  chatter: {
    onStart: string[];
    onMove: string[];
    onCheck: string[];
    onUserCheck: string[];
    onWin: string[];
    onLoss: string[];
  };
}
