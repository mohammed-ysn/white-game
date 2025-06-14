import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PlayerList } from '../components/PlayerList';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function Lobby() {
  const socket = useSocket();
  const room = useGameStore((state) => state.room);
  const canStartGame = useGameStore((state) => state.canStartGame());
  const isHost = useGameStore((state) => state.isHost());
  
  if (!room) return null;
  
  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('start-game');
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    toast.success('Room code copied!');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Waiting Room</h1>
          <div className="flex items-center justify-center gap-4">
            <p className="text-2xl font-mono bg-white px-4 py-2 rounded-lg shadow">
              {room.id}
            </p>
            <Button onClick={handleCopyCode} variant="secondary" size="sm">
              Copy Code
            </Button>
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <PlayerList />
          </Card>
          
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Game Settings</h3>
              <div className="space-y-2 text-gray-600">
                <p>• Minimum 3 players required</p>
                <p>• {room.maxRounds} rounds</p>
                <p>• 30 seconds per turn</p>
                <p>• One player will get "WHITE"</p>
              </div>
              
              {isHost ? (
                <div className="pt-4">
                  {canStartGame() ? (
                    <Button onClick={handleStartGame} size="lg" fullWidth>
                      Start Game
                    </Button>
                  ) : (
                    <p className="text-center text-gray-500">
                      Need at least 3 players to start
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 pt-4">
                  Waiting for host to start the game...
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}