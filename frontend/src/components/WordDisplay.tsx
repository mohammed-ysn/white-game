import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function WordDisplay() {
  const currentWord = useGameStore((state) => state.currentWord);
  
  if (!currentWord) return null;
  
  const isWhite = currentWord === 'WHITE';
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 0.8 }}
      className={`p-8 rounded-2xl ${
        isWhite ? 'bg-white border-4 border-gray-300' : 'bg-primary-600'
      }`}
    >
      <h2 className="text-2xl font-bold text-center mb-2">Your Word:</h2>
      <p className={`text-5xl font-bold text-center ${
        isWhite ? 'text-gray-800' : 'text-white'
      }`}>
        {currentWord}
      </p>
      {isWhite && (
        <p className="text-sm text-gray-600 text-center mt-4">
          You're the imposter! Blend in without revealing yourself.
        </p>
      )}
    </motion.div>
  );
}