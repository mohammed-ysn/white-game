import type { TypedSocket, TypedSocketServer } from '../types/socket';
import type { Player, Room } from '@white-game/shared';
import { RoomService } from '../services/RoomService';
import { GameService } from '../services/GameService';
import { logger } from '../utils/logger';
import { validateRoomCode } from '../utils/room';
import { gameConfig } from '../utils/config';

export function createSocketHandlers(io: TypedSocketServer, roomService: RoomService, gameService: GameService) {
  return function handleConnection(socket: TypedSocket) {
    logger.info({ socketId: socket.id }, 'Client connected');

    socket.on('create-room', (playerName: string) => {
      try {
        const player: Player = {
          id: socket.id,
          name: playerName.trim(),
          score: 0,
          isHost: true,
          hasWhite: false,
          isConnected: true,
        };

        const room = roomService.createRoom(player);
        
        socket.join(room.id);
        socket.data = { playerId: player.id, roomId: room.id, playerName: player.name };
        
        socket.emit('room-update', room);
        logger.info({ roomId: room.id, playerName }, 'Room created by player');
      } catch (error) {
        logger.error({ error, playerName }, 'Error creating room');
        socket.emit('error', 'Failed to create room');
      }
    });

    socket.on('join-room', ({ roomId, playerName }) => {
      try {
        const normalizedRoomId = roomId.toUpperCase().trim();
        
        if (!validateRoomCode(normalizedRoomId)) {
          socket.emit('error', 'Invalid room code');
          return;
        }

        const existingRoom = roomService.getRoom(normalizedRoomId);
        if (!existingRoom) {
          socket.emit('error', 'Room not found');
          return;
        }

        if (existingRoom.players.length >= gameConfig.maxPlayers) {
          socket.emit('error', 'Room is full');
          return;
        }

        if (existingRoom.gameState !== 'lobby') {
          socket.emit('error', 'Game already in progress');
          return;
        }

        const player: Player = {
          id: socket.id,
          name: playerName.trim(),
          score: 0,
          isHost: false,
          hasWhite: false,
          isConnected: true,
        };

        const room = roomService.joinRoom(normalizedRoomId, player);
        if (!room) {
          socket.emit('error', 'Failed to join room');
          return;
        }

        socket.join(room.id);
        socket.data = { playerId: player.id, roomId: room.id, playerName: player.name };
        
        io.to(room.id).emit('room-update', room);
        io.to(room.id).emit('player-joined', player);
        
        logger.info({ roomId: room.id, playerName }, 'Player joined room');
      } catch (error) {
        logger.error({ error, roomId, playerName }, 'Error joining room');
        socket.emit('error', 'Failed to join room');
      }
    });

    socket.on('start-game', () => {
      try {
        const { roomId, playerId } = socket.data;
        if (!roomId || !playerId) {
          socket.emit('error', 'Not in a room');
          return;
        }

        const room = roomService.getRoom(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        const player = room.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          socket.emit('error', 'Only host can start the game');
          return;
        }

        if (room.players.length < gameConfig.minPlayers) {
          socket.emit('error', `Need at least ${gameConfig.minPlayers} players to start`);
          return;
        }

        const updatedRoom = roomService.startGame(roomId);
        if (!updatedRoom) {
          socket.emit('error', 'Failed to start game');
          return;
        }

        // Send word to each player
        updatedRoom.players.forEach(player => {
          const word = player.hasWhite ? 'WHITE' : updatedRoom.currentWord;
          io.to(player.id).emit('game-started', word);
        });

        io.to(roomId).emit('room-update', updatedRoom);
        io.to(roomId).emit('turn-update', updatedRoom.currentTurnPlayerId!, gameConfig.turnDuration);
        
        // Start turn timer
        startTurnTimer(io, roomService, updatedRoom);
        
        logger.info({ roomId }, 'Game started');
      } catch (error) {
        logger.error({ error }, 'Error starting game');
        socket.emit('error', 'Failed to start game');
      }
    });

    socket.on('submit-word', (word: string) => {
      try {
        const { roomId, playerId } = socket.data;
        if (!roomId || !playerId) {
          socket.emit('error', 'Not in a room');
          return;
        }

        if (!gameService.validateWord(word)) {
          socket.emit('error', 'Invalid word');
          return;
        }

        const room = roomService.getRoom(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        // Check if word is too similar to the target
        const player = room.players.find(p => p.id === playerId);
        if (player && !player.hasWhite && !gameService.isRelatedWord(word, room.currentWord)) {
          socket.emit('error', 'Word is too similar to the target word');
          return;
        }

        const updatedRoom = roomService.submitWord(roomId, playerId, word);
        if (!updatedRoom) {
          socket.emit('error', 'Failed to submit word');
          return;
        }

        const submission = updatedRoom.submittedWords[updatedRoom.submittedWords.length - 1];
        io.to(roomId).emit('word-submitted', submission);
        io.to(roomId).emit('room-update', updatedRoom);

        if (updatedRoom.gameState === 'voting') {
          io.to(roomId).emit('voting-phase');
          startVotingTimer(io, roomService, updatedRoom);
        } else if (updatedRoom.currentTurnPlayerId) {
          io.to(roomId).emit('turn-update', updatedRoom.currentTurnPlayerId, gameConfig.turnDuration);
          startTurnTimer(io, roomService, updatedRoom);
        }

        logger.info({ roomId, playerId, word }, 'Word submitted');
      } catch (error) {
        logger.error({ error }, 'Error submitting word');
        socket.emit('error', 'Failed to submit word');
      }
    });

    socket.on('submit-vote', (votedPlayerId: string) => {
      try {
        const { roomId, playerId } = socket.data;
        if (!roomId || !playerId) {
          socket.emit('error', 'Not in a room');
          return;
        }

        const updatedRoom = roomService.submitVote(roomId, playerId, votedPlayerId);
        if (!updatedRoom) {
          socket.emit('error', 'Failed to submit vote');
          return;
        }

        io.to(roomId).emit('room-update', updatedRoom);

        if (updatedRoom.gameState === 'results') {
          const results = gameService.calculateRoundResults(updatedRoom);
          io.to(roomId).emit('round-results', results);
          io.to(roomId).emit('room-update', updatedRoom);
        }

        logger.info({ roomId, voterId: playerId, votedPlayerId }, 'Vote submitted');
      } catch (error) {
        logger.error({ error }, 'Error submitting vote');
        socket.emit('error', 'Failed to submit vote');
      }
    });

    socket.on('next-round', () => {
      try {
        const { roomId, playerId } = socket.data;
        if (!roomId || !playerId) {
          socket.emit('error', 'Not in a room');
          return;
        }

        const room = roomService.getRoom(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        const player = room.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          socket.emit('error', 'Only host can start next round');
          return;
        }

        const updatedRoom = roomService.nextRound(roomId);
        if (!updatedRoom) {
          socket.emit('error', 'Failed to start next round');
          return;
        }

        if (updatedRoom.gameState === 'finished') {
          const finalScores = gameService.getFinalScores(updatedRoom);
          io.to(roomId).emit('game-over', finalScores);
        } else {
          // Send new words
          updatedRoom.players.forEach(player => {
            const word = player.hasWhite ? 'WHITE' : updatedRoom.currentWord;
            io.to(player.id).emit('game-started', word);
          });

          io.to(roomId).emit('turn-update', updatedRoom.currentTurnPlayerId!, gameConfig.turnDuration);
          startTurnTimer(io, roomService, updatedRoom);
        }

        io.to(roomId).emit('room-update', updatedRoom);
        logger.info({ roomId, round: updatedRoom.currentRound }, 'Next round started');
      } catch (error) {
        logger.error({ error }, 'Error starting next round');
        socket.emit('error', 'Failed to start next round');
      }
    });

    socket.on('leave-room', () => {
      handleDisconnect();
    });

    socket.on('disconnect', () => {
      handleDisconnect();
    });

    function handleDisconnect() {
      try {
        const { roomId, playerId, playerName } = socket.data;
        if (!roomId || !playerId) {
          return;
        }

        const room = roomService.removePlayer(roomId, playerId);
        if (room) {
          io.to(roomId).emit('room-update', room);
          io.to(roomId).emit('player-left', playerId);
        }

        socket.leave(roomId);
        logger.info({ roomId, playerId, playerName }, 'Player disconnected');
      } catch (error) {
        logger.error({ error }, 'Error handling disconnect');
      }
    }
  };
}

function startTurnTimer(io: TypedSocketServer, roomService: RoomService, room: Room) {
  let timeLeft = gameConfig.turnDuration;
  
  const timerId = setInterval(() => {
    timeLeft--;
    io.to(room.id).emit('timer-update', timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timerId);
      
      // Auto-submit empty word
      const updatedRoom = roomService.submitWord(room.id, room.currentTurnPlayerId!, '(No answer)');
      if (updatedRoom) {
        io.to(room.id).emit('room-update', updatedRoom);
        
        if (updatedRoom.gameState === 'voting') {
          io.to(room.id).emit('voting-phase');
          startVotingTimer(io, roomService, updatedRoom);
        } else if (updatedRoom.currentTurnPlayerId) {
          io.to(room.id).emit('turn-update', updatedRoom.currentTurnPlayerId, gameConfig.turnDuration);
          startTurnTimer(io, roomService, updatedRoom);
        }
      }
    }
  }, 1000);
}

function startVotingTimer(io: TypedSocketServer, roomService: RoomService, room: Room) {
  let timeLeft = gameConfig.votingDuration;
  
  const timerId = setInterval(() => {
    timeLeft--;
    io.to(room.id).emit('timer-update', timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timerId);
      
      // Force end voting
      roomService.updateGameState(room.id, 'results');
      const updatedRoom = roomService.getRoom(room.id);
      
      if (updatedRoom) {
        const results = new GameService().calculateRoundResults(updatedRoom);
        io.to(room.id).emit('round-results', results);
        io.to(room.id).emit('room-update', updatedRoom);
      }
    }
  }, 1000);
}