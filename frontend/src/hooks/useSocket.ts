import { useEffect, useRef } from 'react';
import { createSocket, TypedSocket } from '../utils/socket';
import { useGameStore } from '../store/gameStore';
import toast from 'react-hot-toast';

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const {
    setConnected,
    setRoom,
    setCurrentWord,
    setTimeLeft,
    setRoundResults,
    setFinalScores,
    setError,
    setPlayer,
    reset,
  } = useGameStore();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = createSocket();
      const socket = socketRef.current;

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

      socket.on('player-left', (playerId) => {
        toast(`A player left the game`);
      });

      // Game events
      socket.on('game-started', (word) => {
        setCurrentWord(word);
        setRoundResults(null);
        toast.success('Game started!');
      });

      socket.on('turn-update', (playerId, timeLeft) => {
        setTimeLeft(timeLeft);
      });

      socket.on('timer-update', (time) => {
        setTimeLeft(time);
      });

      socket.on('word-submitted', (submission) => {
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        reset();
      }
    };
  }, []);

  return socketRef.current;
}