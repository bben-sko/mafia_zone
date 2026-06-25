'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Screen, RoleConfig, INITIAL_ROLE_CONFIG, ROLE_SPECIALS } from '@/lib/game-types';
import { allocateRoles, getCivilCount } from '@/lib/roles';

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; index: number }
  | { type: 'CHANGE_MAFIA'; delta: number }
  | { type: 'TOGGLE_ROLE'; role: string }
  | { type: 'START_GAME' }
  | { type: 'NEXT_TURN' }
  | { type: 'GO_TO_CARD' }
  | { type: 'FLIP_CARD' }
  | { type: 'AFTER_CARD_FLIP' }
  | { type: 'SET_HANDOFF_READY' }
  | { type: 'SELECT_DURATION'; val: number | 'custom' }
  | { type: 'SET_CUSTOM_DUR'; mins: number }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'TIMER_TICK' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'RESTART_TIMER' }
  | { type: 'ADJUST_TIMER'; delta: number }
  | { type: 'APPLY_PRESET'; config: Partial<RoleConfig> }
  | { type: 'RESET_GAME' };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const initialState: GameState = {
  screen: 'lobby',
  players: [],
  shuffled: [],
  roles: [],
  currentIndex: 0,
  allRolesRevealed: false,
  flipped: false,
  roleConfig: { ...INITIAL_ROLE_CONFIG },
  timerDuration: 120,
  timerRemaining: 120,
  timerRunning: false,
  timerStarted: false,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'ADD_PLAYER': {
      if (state.players.includes(action.name)) return state;
      return { ...state, players: [...state.players, action.name] };
    }

    case 'REMOVE_PLAYER': {
      const players = state.players.filter((_, i) => i !== action.index);
      return { ...state, players };
    }

    case 'CHANGE_MAFIA': {
      const newVal = state.roleConfig.mafia + action.delta;
      if (newVal < 1) return state;
      const specials = ROLE_SPECIALS.reduce((sum, r) => sum + (state.roleConfig[r as keyof typeof state.roleConfig] ? 1 : 0), 0);
      if (state.players.length - newVal - specials < 1) return state;
      return {
        ...state,
        roleConfig: { ...state.roleConfig, mafia: newVal }
      };
    }

    case 'TOGGLE_ROLE': {
      const role = action.role as keyof typeof state.roleConfig;
      const current = state.roleConfig[role];
      if (current) {
        const specials = ROLE_SPECIALS.reduce((sum, r) => sum + (r === role ? 0 : (state.roleConfig[r as keyof typeof state.roleConfig] ? 1 : 0)), 0);
        if (state.players.length >= 4 && state.players.length - state.roleConfig.mafia - specials < 1) return state;
      }
      const newConfig = { ...state.roleConfig, [role]: !current };
      const civil = getCivilCount(state.players.length, newConfig);
      if (civil < 1 && newConfig.mafia > 1) newConfig.mafia = Math.max(1, newConfig.mafia + civil - 1);
      return { ...state, roleConfig: newConfig };
    }

    case 'START_GAME': {
      if (state.players.length < 4) return state;
      const shuffled = shuffleArray(state.players);
      const roles = allocateRoles(shuffled.length, state.roleConfig);
      return {
        ...state,
        shuffled,
        roles,
        currentIndex: 0,
        allRolesRevealed: false,
        flipped: false,
        screen: 'turn',
      };
    }

    case 'GO_TO_CARD': {
      return { ...state, flipped: false, screen: 'card' };
    }

    case 'FLIP_CARD': {
      if (state.flipped) return state;
      return { ...state, flipped: true };
    }

    case 'AFTER_CARD_FLIP': {
      const isLast = state.currentIndex === state.shuffled.length - 1;
      if (isLast) {
        return { ...state, allRolesRevealed: true, screen: 'discussion', timerRunning: false, timerStarted: false };
      } else {
        return { ...state, screen: 'handoff' };
      }
    }

    case 'NEXT_TURN': {
      return { ...state, currentIndex: state.currentIndex + 1, screen: 'turn' };
    }

    case 'SELECT_DURATION': {
      if (action.val === 'custom') return state;
      return { ...state, timerDuration: action.val, timerRemaining: action.val, timerStarted: false };
    }

    case 'SET_CUSTOM_DUR': {
      const secs = Math.max(60, Math.min(600, action.mins * 60));
      return { ...state, timerDuration: secs, timerRemaining: secs, timerStarted: false };
    }

    case 'TOGGLE_TIMER': {
      if (state.timerRunning) {
        return { ...state, timerRunning: false };
      }
      if (state.timerRemaining <= 0) return state;
      return { ...state, timerRunning: true, timerStarted: true };
    }

    case 'TIMER_TICK': {
      const remaining = state.timerRemaining - 1;
      if (remaining <= 0) {
        return { ...state, timerRemaining: 0, timerRunning: false };
      }
      return { ...state, timerRemaining: remaining };
    }

    case 'PAUSE_TIMER': {
      return { ...state, timerRunning: false };
    }

    case 'STOP_TIMER': {
      return { ...state, timerRunning: false };
    }

    case 'RESTART_TIMER': {
      return {
        ...state,
        timerRemaining: state.timerDuration,
        timerRunning: false,
        timerStarted: false,
      };
    }

    case 'ADJUST_TIMER': {
      const max = state.timerDuration + 120;
      const remaining = Math.max(10, Math.min(state.timerRemaining + action.delta, max));
      return { ...state, timerRemaining: remaining };
    }

    case 'APPLY_PRESET': {
      return { ...state, roleConfig: { ...state.roleConfig, ...action.config } };
    }

    case 'RESET_GAME': {
      return { ...initialState, roleConfig: { ...INITIAL_ROLE_CONFIG } };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  getCivilCount: () => number;
  countSpecials: (exclude?: string) => number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const civilCount = () => {
    return getCivilCount(state.players.length, state.roleConfig);
  };

  const countSpecials = (exclude?: string) => {
    return ROLE_SPECIALS.reduce((sum, r) => {
      if (r === exclude) return sum;
      return sum + (state.roleConfig[r as keyof typeof state.roleConfig] ? 1 : 0);
    }, 0);
  };

  return (
    <GameContext.Provider value={{ state, dispatch, getCivilCount: civilCount, countSpecials }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
