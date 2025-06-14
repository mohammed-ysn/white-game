import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function WordList() {
  const room = useGameStore((state) => state.room);
  
  if (!room || room.submittedWords.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Words Said</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {room.submittedWords.map((submission, index) => {
          const player = room.players.find(p => p.id === submission.playerId);
          return (
            <motion.div
              key={`${submission.playerId}-${submission.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg"
            >
              <span className="font-medium text-gray-700">{player?.name}:</span>
              <span className="text-gray-900">{submission.word}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}