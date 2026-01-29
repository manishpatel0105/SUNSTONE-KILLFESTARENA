export type GameType = 'bgmi' | 'freefire' | 'shadowfight';

export type BGMIMode = 'tdm' | 'classic';
export type FreefireMode = 'br' | 'cs';
export type GameMode = BGMIMode | FreefireMode | '3v3';

export interface SquadMember {
  name: string;
  gameUsername: string;
  gameId: string;
  isLeader: boolean;
}

export interface GameInfo {
  id: GameType;
  name: string;
  fullName: string;
  modes: { id: GameMode; name: string; description?: string }[];
  image: string;
  color: string;
  isSquad: boolean;
  rules?: string[];
}

export interface RegistrationFormData {
  fullName: string;
  college: string;
  studentId: string;
  phone: string;
  email: string;
  gameUsername: string;
  gameId: string;
  game: GameType;
  mode: GameMode;
  squadName?: string;
  members?: SquadMember[];
}

export interface Ticket {
  registrationId: string;
  participantName: string;
  college: string;
  studentId: string;
  phone: string;
  email: string;
  gameUsername: string;
  gameId: string;
  game: string;
  mode: string;
  registeredAt: string;
  squadName?: string;
  members?: SquadMember[];
}

export const GAMES: GameInfo[] = [
  {
    id: 'bgmi',
    name: 'BGMI',
    fullName: 'Battlegrounds Mobile India',
    modes: [
      { id: 'tdm', name: 'TDM 4v4', description: 'Team Deathmatch - 4 vs 4 players' },
      { id: 'classic', name: 'Classic', description: 'Battle Royale - Last team standing' }
    ],
    // Use local asset path; placeholder SVG at public/game-icons/bgmi.svg
    image: '/game-icons/bgmi.png',
    color: 'from-amber-500 to-orange-600',
    isSquad: true
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    fullName: 'Garena Free Fire',
    modes: [
      { id: 'br', name: 'Battle Royale', description: 'Classic Battle Royale mode' },
      { id: 'cs', name: 'Clash Squad', description: 'Round-based 4v4 combat' }
    ],
    // Use local asset path; placeholder SVG at public/game-icons/freefire.svg
    image: '/game-icons/freefire.png',
    color: 'from-orange-500 to-red-600',
    isSquad: true
  },
  {
    id: 'shadowfight',
    name: 'Shadow Fight 4',
    fullName: 'Shadow Fight 4: Arena',
    modes: [
      { id: '3v3', name: '3v3 Arena', description: 'Team-based hero combat' }
    ],
    // Use local asset path; placeholder SVG at public/game-icons/shadowfight.svg
    image: '/game-icons/shadowfight.png',
    color: 'from-purple-500 to-indigo-600',
    isSquad: false,
    rules: [
      'Match type: 3v3 (Single player controlling 3 heroes)',
      'Characters: Player’s choice',
      'Character levels: Equal for all players'
    ]
  }
];

export const PRIZE_POOL = {
  total: 42500,
  perMode: 8500,
  totalModes: 5,
  first: 5000,
  second: 2500,
  third: 1000
};

export const FEATURED_MODES = [
  { game: 'BGMI', mode: 'TDM 4v4', prize: 8500 },
  { game: 'BGMI', mode: 'Classic', prize: 8500 },
  { game: 'Free Fire', mode: 'Battle Royale', prize: 8500 },
  { game: 'Free Fire', mode: 'Clash Squad', prize: 8500 },
  { game: 'Shadow Fight 4', mode: '3v3 Arena', prize: 8500 },
];

export const EVENT_SCHEDULE = {
  registrationEnd: '2 February 2026',
  qualifiers: '5 February 2026',
  finals: '6 February 2026',
  time: '11:00 AM',
  venue: '1st Floor, Room 102'
};

export const POINT_SYSTEM = {
  positions: [
    { position: 1, points: 15 },
    { position: 2, points: 10 },
    { position: 3, points: 5 },
    { position: 4, points: 3 }
  ],
  killPoints: 1
};
