import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function PlayerList() {
  const room = useGameStore((state) => state.room);
  const currentPlayerId = useGameStore((state) => state.playerId);
  
  if (!room) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Players ({room.players.length})</h3>
      <div className="space-y-2">
        {room.players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.id === currentPlayerId ? 'bg-primary-100 border-2 border-primary-300' : 'bg-gray-100'
            } ${room.currentTurnPlayerId === player.id ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{player.name}</span>
              {player.isHost && (
                <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">Host</span>
              )}
              {player.id === currentPlayerId && (
                <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded">You</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{player.score} pts</span>
              {!player.isConnected && (
                <span className="w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}