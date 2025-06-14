import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function Timer() {
  const timeLeft = useGameStore((state) => state.timeLeft);
  
  if (timeLeft === 0) return null;
  
  const isLowTime = timeLeft <= 10;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <motion.div
      className={`text-4xl font-bold ${isLowTime ? 'text-red-600' : 'text-gray-800'}`}
      animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
    >
      {formattedTime}
    </motion.div>
  );
}