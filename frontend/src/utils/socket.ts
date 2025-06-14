import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@white-game/shared';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): TypedSocket {
  // Always use the current origin for socket connections
  // This ensures it works with both localhost and ngrok
  const socket: TypedSocket = io({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
}