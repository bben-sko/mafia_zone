export type RoleKey =
  | 'mafia'
  | 'civil'
  | 'detective'
  | 'doctor'
  | 'chouafa'
  | 'laadoul'
  | 'spy'
  | 'mayor'
  | 'avenger'
  | 'impostor'
  | 'madman'
  | 'oracle'
  | 'mirror'
  | 'guard'
  | 'witch'
  | 'loneWolf';

export interface RoleData {
  label: string;
  class: string;
  badge: string;
  description: string;
  icon: string;
}

export interface RoleInfoData {
  emoji: string;
  label: string;
  team: string;
  teamClass: string;
  ability: string;
  winCondition: string;
  description: string;
}

export interface RoleConfig {
  mafia: number;
  detective: boolean;
  doctor: boolean;
  chouafa: boolean;
  laadoul: boolean;
  spy: boolean;
  mayor: boolean;
  avenger: boolean;
  impostor: boolean;
  madman: boolean;
  oracle: boolean;
  mirror: boolean;
  guard: boolean;
  witch: boolean;
  loneWolf: boolean;
}

export type Screen = 'lobby' | 'setup' | 'turn' | 'handoff' | 'card' | 'discussion' | 'end';

export interface GameState {
  screen: Screen;
  players: string[];
  shuffled: string[];
  roles: RoleKey[];
  currentIndex: number;
  allRolesRevealed: boolean;
  flipped: boolean;
  roleConfig: RoleConfig;
  timerDuration: number;
  timerRemaining: number;
  timerRunning: boolean;
  timerStarted: boolean;
}

export const ROLE_SPECIALS: RoleKey[] = [
  'detective', 'doctor', 'chouafa', 'laadoul', 'spy', 'mayor',
  'avenger', 'impostor', 'madman', 'oracle', 'mirror', 'guard', 'witch', 'loneWolf'
];

export const INITIAL_ROLE_CONFIG: RoleConfig = {
  mafia: 1,
  detective: true,
  doctor: true,
  chouafa: false,
  laadoul: false,
  spy: false,
  mayor: false,
  avenger: false,
  impostor: false,
  madman: false,
  oracle: false,
  mirror: false,
  guard: false,
  witch: false,
  loneWolf: false,
};
