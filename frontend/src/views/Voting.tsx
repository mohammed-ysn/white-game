import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Timer } from '../components/Timer';
import { WordList } from '../components/WordList';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function Voting() {
  const socket = useSocket();
  const room = useGameStore((state) => state.room);
  const playerId = useGameStore((state) => state.playerId);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  if (!room || room.gameState !== 'voting') return null;
  
  const handleVote = () => {
    if (!socket || !selectedPlayer || hasVoted) return;
    
    socket.emit('submit-vote', selectedPlayer);
    setHasVoted(true);
    toast.success('Vote submitted!');
  };
  
  const otherPlayers = room.players.filter(p => p.id !== playerId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Time to Vote!</h2>
          <p className="text-gray-600 mb-4">Who do you think has "WHITE"?</p>
          <Timer />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <WordList />
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Cast Your Vote</h3>
            <div className="space-y-3">
              {otherPlayers.map((player) => (
                <motion.button
                  key={player.id}
                  onClick={() => !hasVoted && setSelectedPlayer(player.id)}
                  disabled={hasVoted}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPlayer === player.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${hasVoted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  whileHover={!hasVoted ? { scale: 1.02 } : {}}
                  whileTap={!hasVoted ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{player.name}</span>
                    {selectedPlayer === player.id && (
                      <span className="text-primary-600">✓</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-6">
              {hasVoted ? (
                <p className="text-center text-gray-600">
                  Waiting for other players to vote...
                </p>
              ) : (
                <Button
                  onClick={handleVote}
                  fullWidth
                  disabled={!selectedPlayer}
                >
                  Submit Vote
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}