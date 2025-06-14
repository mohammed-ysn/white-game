import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents,
  Player,
  Room 
} from '@white-game/shared';

export type TypedSocketServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export interface SocketData {
  playerId: string;
  roomId: string;
  playerName: string;
}

export interface GameSession {
  player: Player;
  room: Room;
  socket: TypedSocket;
}