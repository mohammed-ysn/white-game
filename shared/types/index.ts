// Player type
export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  hasWhite: boolean;
  isConnected: boolean;
}

// Game state types
export type GameState = 'lobby' | 'playing' | 'voting' | 'results' | 'finished';

// Word submission
export interface WordSubmission {
  playerId: string;
  word: string;
  timestamp: number;
}

// Room type
export interface Room {
  id: string;
  players: Player[];
  currentWord: string;
  currentRound: number;
  maxRounds: number;
  gameState: GameState;
  currentTurnPlayerId: string | null;
  submittedWords: WordSubmission[];
  votes: Map<string, string>;
  turnTimeLeft: number;
}

// Round results
export interface RoundResults {
  whitePlayerId: string;
  correctVoters: string[];
  scores: { [playerId: string]: number };
}

// Player score
export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
}

// Socket event types with type safety
export interface ServerToClientEvents {
  'room-update': (room: Room) => void;
  'game-started': (word: string) => void;
  'turn-update': (playerId: string, timeLeft: number) => void;
  'word-submitted': (submission: WordSubmission) => void;
  'voting-phase': () => void;
  'round-results': (results: RoundResults) => void;
  'game-over': (finalScores: PlayerScore[]) => void;
  'error': (message: string) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'timer-update': (timeLeft: number) => void;
}

export interface ClientToServerEvents {
  'join-room': (data: { roomId: string; playerName: string }) => void;
  'create-room': (playerName: string) => void;
  'start-game': () => void;
  'submit-word': (word: string) => void;
  'submit-vote': (playerId: string) => void;
  'next-round': () => void;
  'leave-room': () => void;
}

// Game configuration
export interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  turnDuration: number; // seconds
  votingDuration: number; // seconds
  defaultRounds: number;
}

// Word categories
export type WordCategory = 'animals' | 'foods' | 'objects' | 'places' | 'activities' | 'movies' | 'books';

// Error types
export interface GameError {
  code: string;
  message: string;
}