import type { Room, RoundResults, PlayerScore } from '@white-game/shared';
import { logger } from '../utils/logger';

export class GameService {
  calculateRoundResults(room: Room): RoundResults {
    const whitePlayer = room.players.find(p => p.hasWhite);
    if (!whitePlayer) {
      throw new Error('No player with white found');
    }

    const correctVoters: string[] = [];
    const scores: { [playerId: string]: number } = {};

    // Initialise scores
    room.players.forEach(player => {
      scores[player.id] = 0;
    });

    // Calculate who voted correctly
    room.votes.forEach((votedPlayerId, voterId) => {
      if (votedPlayerId === whitePlayer.id) {
        correctVoters.push(voterId);
        scores[voterId] = 10; // Points for correct guess
      }
    });

    // White player gets points if they weren't caught by majority
    const whiteVotes = Array.from(room.votes.values()).filter(id => id === whitePlayer.id).length;
    if (whiteVotes < Math.floor(room.players.length / 2)) {
      scores[whitePlayer.id] = 15; // Points for successful deception
    }

    // Update player scores
    room.players.forEach(player => {
      player.score += scores[player.id] || 0;
    });

    logger.info({ 
      roomId: room.id, 
      whitePlayerId: whitePlayer.id, 
      correctVoters: correctVoters.length 
    }, 'Round results calculated');

    return {
      whitePlayerId: whitePlayer.id,
      correctVoters,
      scores,
    };
  }

  getFinalScores(room: Room): PlayerScore[] {
    return room.players
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        score: player.score,
      }))
      .sort((a, b) => b.score - a.score);
  }

  validateWord(word: string): boolean {
    // Basic validation - no empty strings, reasonable length
    const trimmed = word.trim();
    return trimmed.length > 0 && trimmed.length <= 50;
  }

  isRelatedWord(word: string, targetWord: string): boolean {
    // Simple check - ensure the submitted word doesn't contain the target word
    const lowerWord = word.toLowerCase();
    const lowerTarget = targetWord.toLowerCase();
    
    return !lowerWord.includes(lowerTarget) && !lowerTarget.includes(lowerWord);
  }
}