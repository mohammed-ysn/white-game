import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export function GameOver() {
  const room = useGameStore((state) => state.room);
  const finalScores = useGameStore((state) => state.finalScores);
  const reset = useGameStore((state) => state.reset);
  
  useEffect(() => {
    // Trigger confetti for the winner
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  if (!room || room.gameState !== 'finished' || !finalScores) return null;
  
  const handlePlayAgain = () => {
    reset();
    window.location.reload();
  };
  
  const winner = finalScores[0];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Game Over!</h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <p className="text-2xl text-gray-600 mb-2">The winner is:</p>
            <p className="text-6xl font-bold text-primary-600">{winner.playerName}</p>
            <p className="text-3xl text-gray-700 mt-2">{winner.score} points</p>
          </motion.div>
        </motion.div>
        
        <Card>
          <h3 className="text-xl font-semibold mb-6 text-center">Final Standings</h3>
          <div className="space-y-3">
            {finalScores.map((score, index) => (
              <motion.div
                key={score.playerId}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                  index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
                  index === 2 ? 'bg-orange-100 border-2 border-orange-300' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-500">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="text-lg font-medium">{score.playerName}</span>
                </div>
                <span className="text-xl font-bold">{score.score} pts</span>
              </motion.div>
            ))}
          </div>
        </Card>
        
        <div className="text-center mt-8">
          <Button onClick={handlePlayAgain} size="lg">
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}