import { useEffect } from 'react';
import { createSocket, TypedSocket } from '../utils/socket';
import { useGameStore } from '../store/gameStore';
import toast from 'react-hot-toast';

// Global socket instance to persist across component changes
let globalSocket: TypedSocket | null = null;

export function useSocket() {
  const {
    setConnected,
    setRoom,
    setCurrentWord,
    setTimeLeft,
    setRoundResults,
    setFinalScores,
    setError,
  } = useGameStore();

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = createSocket();
      const socket = globalSocket;

      // Connection events
      socket.on('connect', () => {
        setConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        setConnected(false);
        setError('Connection lost. Reconnecting...');
      });

      // Room events
      socket.on('room-update', (room) => {
        setRoom(room);
      });

      socket.on('player-joined', (player) => {
        toast.success(`${player.name} joined the game`);
      });

      socket.on('player-left', () => {
        toast(`A player left the game`);
      });

      // Game events
      socket.on('game-started', (word) => {
        setCurrentWord(word);
        setRoundResults(null);
        toast.success('Game started!');
      });

      socket.on('turn-update', (_, timeLeft) => {
        setTimeLeft(timeLeft);
      });

      socket.on('timer-update', (time) => {
        setTimeLeft(time);
      });

      socket.on('word-submitted', () => {
        // Word submissions are already in room update
      });

      socket.on('voting-phase', () => {
        toast('Time to vote!', { icon: '🗳️' });
      });

      socket.on('round-results', (results) => {
        setRoundResults(results);
      });

      socket.on('game-over', (scores) => {
        setFinalScores(scores);
        toast('Game Over!', { icon: '🏆' });
      });

      socket.on('error', (message) => {
        setError(message);
        toast.error(message);
      });
    }
  }, [setConnected, setRoom, setCurrentWord, setTimeLeft, setRoundResults, setFinalScores, setError]);

  return globalSocket;
}