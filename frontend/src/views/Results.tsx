import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

export function Results() {
  const socket = useSocket();
  const room = useGameStore((state) => state.room);
  const lastRoundResults = useGameStore((state) => state.lastRoundResults);
  const isHost = useGameStore((state) => state.isHost());
  
  if (!room || room.gameState !== 'results' || !lastRoundResults) return null;
  
  const whitePlayer = room.players.find(p => p.id === lastRoundResults.whitePlayerId);
  const correctVoters = lastRoundResults.correctVoters.map(voterId => 
    room.players.find(p => p.id === voterId)
  ).filter(Boolean);
  
  const handleNextRound = () => {
    if (!socket) return;
    socket.emit('next-round');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Round Results</h2>
        </motion.div>
        
        <div className="space-y-6">
          <Card>
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">The player with "WHITE" was:</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-4xl font-bold text-primary-600"
              >
                {whitePlayer?.name}
              </motion.p>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Correct Guesses</h3>
            {correctVoters.length > 0 ? (
              <div className="space-y-2">
                {correctVoters.map((player, index) => (
                  <motion.div
                    key={player!.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-green-100 rounded-lg"
                  >
                    <span className="font-medium">{player!.name}</span>
                    <span className="text-green-700 font-semibold">+10 points</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No one guessed correctly!</p>
            )}
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Scores</h3>
            <div className="space-y-2">
              {room.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <span className="text-lg font-semibold">{player.score} pts</span>
                  </motion.div>
                ))}
            </div>
          </Card>
          
          {isHost && (
            <div className="text-center">
              <Button onClick={handleNextRound} size="lg">
                {room.currentRound < room.maxRounds ? 'Next Round' : 'View Final Results'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}