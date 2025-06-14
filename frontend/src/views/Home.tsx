import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

interface JoinFormData {
  playerName: string;
  roomCode?: string;
}

export function Home() {
  const socket = useSocket();
  const { setPlayer } = useGameStore();
  const [mode, setMode] = useState<'join' | 'create' | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinFormData>();
  
  const onSubmit = (data: JoinFormData) => {
    if (!socket) return;
    
    const playerName = data.playerName.trim();
    
    if (mode === 'create') {
      socket.emit('create-room', playerName);
      setPlayer(socket.id!, playerName);
    } else if (mode === 'join' && data.roomCode) {
      socket.emit('join-room', {
        roomId: data.roomCode.toUpperCase(),
        playerName,
      });
      setPlayer(socket.id!, playerName);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-primary-600 mb-2">White</h1>
          <p className="text-gray-600">The word guessing game</p>
        </div>
        
        {!mode ? (
          <Card>
            <div className="space-y-4">
              <Button
                onClick={() => setMode('create')}
                size="lg"
                fullWidth
              >
                Create Room
              </Button>
              <Button
                onClick={() => setMode('join')}
                variant="secondary"
                size="lg"
                fullWidth
              >
                Join Room
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <button
              onClick={() => setMode(null)}
              className="text-gray-500 hover:text-gray-700 mb-4"
            >
              ← Back
            </button>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                fullWidth
                {...register('playerName', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 20, message: 'Name must be less than 20 characters' },
                })}
                error={errors.playerName?.message}
              />
              
              {mode === 'join' && (
                <Input
                  label="Room Code"
                  placeholder="Enter 6-letter code"
                  fullWidth
                  maxLength={6}
                  style={{ textTransform: 'uppercase' }}
                  {...register('roomCode', {
                    required: 'Room code is required',
                    pattern: {
                      value: /^[A-Za-z]{6}$/,
                      message: 'Room code must be 6 letters',
                    },
                  })}
                  error={errors.roomCode?.message}
                />
              )}
              
              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {mode === 'create' ? 'Create Room' : 'Join Room'}
              </Button>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  );
}