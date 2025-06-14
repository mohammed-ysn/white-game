import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Timer } from '../components/Timer';
import { PlayerList } from '../components/PlayerList';
import { WordDisplay } from '../components/WordDisplay';
import { WordList } from '../components/WordList';
import { motion } from 'framer-motion';

interface WordFormData {
  word: string;
}

export function Game() {
  const socket = useSocket();
  const room = useGameStore((state) => state.room);
  const isMyTurn = useGameStore((state) => state.isMyTurn());
  const currentWord = useGameStore((state) => state.currentWord);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WordFormData>();
  
  if (!room || room.gameState !== 'playing') return null;
  
  const currentPlayer = room.players.find(p => p.id === room.currentTurnPlayerId);
  
  const onSubmit = (data: WordFormData) => {
    if (!socket || !isMyTurn) return;
    
    socket.emit('submit-word', data.word);
    reset();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Round {room.currentRound} of {room.maxRounds}
          </h2>
          <Timer />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentWord && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <WordDisplay />
              </motion.div>
            )}
            
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {isMyTurn ? "Your Turn!" : `${currentPlayer?.name}'s Turn`}
                  </h3>
                </div>
                
                {isMyTurn ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      placeholder="Enter a related word..."
                      fullWidth
                      autoFocus
                      {...register('word', {
                        required: 'Please enter a word',
                        minLength: { value: 1, message: 'Word cannot be empty' },
                        maxLength: { value: 50, message: 'Word is too long' },
                      })}
                      error={errors.word?.message}
                    />
                    <Button type="submit" fullWidth>
                      Submit Word
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Waiting for {currentPlayer?.name} to submit a word...</p>
                  </div>
                )}
              </div>
            </Card>
            
            <Card>
              <WordList />
            </Card>
          </div>
          
          <div>
            <Card>
              <PlayerList />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}