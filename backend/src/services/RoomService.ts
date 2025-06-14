import type { Room, Player, GameState, WordSubmission } from '@white-game/shared';
import { generateRoomCode } from '../utils/room';
import { getRandomWord } from '../utils/words';
import { gameConfig } from '../utils/config';
import { logger } from '../utils/logger';

export class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(hostPlayer: Player): Room {
    const roomCode = generateRoomCode();
    
    const room: Room = {
      id: roomCode,
      players: [hostPlayer],
      currentWord: '',
      currentRound: 0,
      maxRounds: gameConfig.defaultRounds,
      gameState: 'lobby',
      currentTurnPlayerId: null,
      submittedWords: [],
      votes: new Map(),
      turnTimeLeft: gameConfig.turnDuration,
    };

    this.rooms.set(roomCode, room);
    logger.info({ roomCode, hostId: hostPlayer.id }, 'Room created');
    
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, player: Player): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    if (room.players.length >= gameConfig.maxPlayers) {
      return null;
    }

    if (room.gameState !== 'lobby') {
      return null;
    }

    room.players.push(player);
    logger.info({ roomId, playerId: player.id }, 'Player joined room');
    
    return room;
  }

  removePlayer(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    room.players = room.players.filter(p => p.id !== playerId);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      logger.info({ roomId }, 'Room deleted - no players');
      return null;
    }

    // Assign new host if needed
    if (!room.players.some(p => p.isHost)) {
      room.players[0].isHost = true;
    }

    // Handle mid-game disconnection
    if (room.gameState === 'playing' && room.currentTurnPlayerId === playerId) {
      this.nextTurn(room);
    }

    logger.info({ roomId, playerId }, 'Player removed from room');
    return room;
  }

  startGame(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    if (room.players.length < gameConfig.minPlayers) {
      return null;
    }

    // Reset game state
    room.currentRound = 1;
    room.gameState = 'playing';
    room.submittedWords = [];
    room.votes.clear();
    
    // Assign word
    this.assignWords(room);
    
    // Set first player turn
    room.currentTurnPlayerId = room.players[0].id;
    room.turnTimeLeft = gameConfig.turnDuration;

    logger.info({ roomId, round: room.currentRound }, 'Game started');
    return room;
  }

  private assignWords(room: Room) {
    const word = getRandomWord();
    room.currentWord = word;

    // Reset all players
    room.players.forEach(player => {
      player.hasWhite = false;
    });

    // Randomly assign white to one player
    const whitePlayerIndex = Math.floor(Math.random() * room.players.length);
    room.players[whitePlayerIndex].hasWhite = true;

    logger.debug({ roomId: room.id, word, whitePlayerId: room.players[whitePlayerIndex].id }, 'Words assigned');
  }

  submitWord(roomId: string, playerId: string, word: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') {
      return null;
    }

    if (room.currentTurnPlayerId !== playerId) {
      return null;
    }

    const submission: WordSubmission = {
      playerId,
      word: word.trim(),
      timestamp: Date.now(),
    };

    room.submittedWords.push(submission);
    this.nextTurn(room);

    return room;
  }

  private nextTurn(room: Room) {
    const currentIndex = room.players.findIndex(p => p.id === room.currentTurnPlayerId);
    const nextIndex = (currentIndex + 1) % room.players.length;

    // Check if all players have submitted
    if (room.submittedWords.length >= room.players.length) {
      room.gameState = 'voting';
      room.currentTurnPlayerId = null;
      room.votes.clear();
      logger.info({ roomId: room.id }, 'Moving to voting phase');
    } else {
      room.currentTurnPlayerId = room.players[nextIndex].id;
      room.turnTimeLeft = gameConfig.turnDuration;
    }
  }

  submitVote(roomId: string, voterId: string, votedPlayerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'voting') {
      return null;
    }

    // Can't vote for yourself
    if (voterId === votedPlayerId) {
      return null;
    }

    room.votes.set(voterId, votedPlayerId);

    // Check if all players have voted
    if (room.votes.size >= room.players.length) {
      room.gameState = 'results';
      logger.info({ roomId: room.id }, 'All votes submitted');
    }

    return room;
  }

  nextRound(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'results') {
      return null;
    }

    room.currentRound++;

    if (room.currentRound > room.maxRounds) {
      room.gameState = 'finished';
      logger.info({ roomId: room.id }, 'Game finished');
    } else {
      room.gameState = 'playing';
      room.submittedWords = [];
      room.votes.clear();
      this.assignWords(room);
      room.currentTurnPlayerId = room.players[0].id;
      room.turnTimeLeft = gameConfig.turnDuration;
      logger.info({ roomId: room.id, round: room.currentRound }, 'Starting next round');
    }

    return room;
  }

  updateGameState(roomId: string, gameState: GameState): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    room.gameState = gameState;
    return room;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}