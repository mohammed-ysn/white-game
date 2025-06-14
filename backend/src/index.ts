import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { Server } from 'socket.io';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { RoomService } from './services/RoomService';
import { GameService } from './services/GameService';
import { createSocketHandlers } from './handlers/socketHandlers';
import type { TypedSocketServer } from './types/socket';

async function start() {
  // Create Fastify instance
  const fastify = Fastify({
    logger: logger,
  });

  // Register plugins
  await fastify.register(cors, config.cors);
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'ws:', 'wss:'],
      },
    },
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API endpoint for room info (optional)
  fastify.get('/api/rooms/:roomId', async (request) => {
    const { roomId } = request.params as { roomId: string };
    const room = roomService.getRoom(roomId.toUpperCase());
    
    if (!room) {
      return { error: 'Room not found' };
    }

    // Return limited info for security
    return {
      id: room.id,
      playerCount: room.players.length,
      gameState: room.gameState,
      currentRound: room.currentRound,
      maxRounds: room.maxRounds,
    };
  });

  // Create Socket.IO server
  const io: TypedSocketServer = new Server(fastify.server, {
    cors: config.cors,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  // Create services
  const roomService = new RoomService();
  const gameService = new GameService();

  // Set up socket handlers
  io.on('connection', createSocketHandlers(io, roomService, gameService));

  // Start server
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Server listening on port ${config.port}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }

  // Graceful shutdown
  const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    
    try {
      io.close();
      await fastify.close();
      logger.info('Server closed');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

// Start the server
start().catch((err) => {
  logger.error(err, 'Unhandled error');
  process.exit(1);
});