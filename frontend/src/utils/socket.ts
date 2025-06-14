import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@white-game/shared';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): TypedSocket {
  // Dynamically determine the socket URL based on current location
  const getSocketUrl = () => {
    const { hostname, protocol } = window.location;
    
    // If running through ngrok or any external domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}`;
    }
    
    // Local development
    return import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
  };

  const socket: TypedSocket = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
}