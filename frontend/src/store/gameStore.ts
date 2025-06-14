import { create } from 'zustand';
import type { Room, Player, RoundResults, PlayerScore } from '@white-game/shared';

interface GameStore {
  // Connection state
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // Player state
  playerId: string | null;
  playerName: string | null;
  setPlayer: (id: string, name: string) => void;

  // Room state
  room: Room | null;
  setRoom: (room: Room | null) => void;

  // Game state
  currentWord: string | null;
  setCurrentWord: (word: string) => void;
  
  timeLeft: number;
  setTimeLeft: (time: number) => void;

  // Round results
  lastRoundResults: RoundResults | null;
  setRoundResults: (results: RoundResults | null) => void;

  // Final scores
  finalScores: PlayerScore[] | null;
  setFinalScores: (scores: PlayerScore[] | null) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Helper getters
  isHost: () => boolean;
  isMyTurn: () => boolean;
  getCurrentPlayer: () => Player | undefined;
  canStartGame: () => boolean;
  
  // Reset
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Connection state
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // Player state
  playerId: null,
  playerName: null,
  setPlayer: (id, name) => set({ playerId: id, playerName: name }),

  // Room state
  room: null,
  setRoom: (room) => set({ room }),

  // Game state
  currentWord: null,
  setCurrentWord: (word) => set({ currentWord: word }),
  
  timeLeft: 0,
  setTimeLeft: (time) => set({ timeLeft: time }),

  // Round results
  lastRoundResults: null,
  setRoundResults: (results) => set({ lastRoundResults: results }),

  // Final scores
  finalScores: null,
  setFinalScores: (scores) => set({ finalScores: scores }),

  // Error state
  error: null,
  setError: (error) => set({ error }),

  // Helper getters
  isHost: () => {
    const { playerId, room } = get();
    if (!playerId || !room) return false;
    const player = room.players.find(p => p.id === playerId);
    return player?.isHost || false;
  },

  isMyTurn: () => {
    const { playerId, room } = get();
    return room?.currentTurnPlayerId === playerId;
  },

  getCurrentPlayer: () => {
    const { playerId, room } = get();
    if (!playerId || !room) return undefined;
    return room.players.find(p => p.id === playerId);
  },

  canStartGame: () => {
    const { room } = get();
    const isHost = get().isHost();
    return isHost && room?.gameState === 'lobby' && (room?.players.length || 0) >= 3;
  },

  // Reset
  reset: () => set({
    isConnected: false,
    playerId: null,
    playerName: null,
    room: null,
    currentWord: null,
    timeLeft: 0,
    lastRoundResults: null,
    finalScores: null,
    error: null,
  }),
}));