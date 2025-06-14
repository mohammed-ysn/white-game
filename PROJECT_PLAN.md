# White Game Project Plan

## Overview
A web-based multiplayer game where players receive the same word except one player who gets "White". Players take turns saying related words without revealing the original word, then vote on who the imposter is.

## Architecture

### Tech Stack
- **Backend**: Node.js with TypeScript, Fastify, and Socket.io for real-time communication
- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **State Management**: Zustand for client state
- **Infrastructure**: Docker with docker-compose for easy deployment
- **Tunneling**: ngrok for sharing local instance
- **Testing**: Vitest for unit tests, Playwright for E2E tests

### Project Structure
```
white-game/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── types/
│   │   ├── services/
│   │   ├── handlers/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
├── shared/
│   ├── types/
│   │   └── index.ts
│   └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── .gitignore
├── start.sh
└── README.md
```

## Game Flow

1. **Lobby Phase**
   - Players join the game room
   - Minimum 3 players required
   - Host can start the game

2. **Word Distribution**
   - Server randomly selects a word from a predefined list
   - All players receive the word except one random player who gets "White"

3. **Play Phase**
   - Players take turns saying one word related to the theme
   - Turn timer (30 seconds)
   - Other players can see who's speaking

4. **Voting Phase**
   - All players vote on who they think has "White"
   - Cannot vote for yourself
   - Results revealed after all votes

5. **Score & Next Round**
   - Points awarded for correct guesses
   - Game continues for set number of rounds

## Implementation Steps

### Phase 1: Basic Setup
1. Create folder structure
2. Set up Docker configuration
3. Initialize backend with Fastify and Socket.io
4. Create React frontend with Vite and TypeScript
5. Set up shared types package
6. Configure ngrok integration

### Phase 2: Core Game Logic
1. Implement room/lobby system
2. Add player management
3. Create word distribution logic
4. Implement turn-based gameplay

### Phase 3: Game Features
1. Add voting mechanism
2. Implement scoring system
3. Create game state management
4. Add round progression

### Phase 4: Polish
1. Improve UI/UX with animations (Framer Motion)
2. Add error handling and recovery
3. Implement reconnection logic
4. Add game settings (timer, rounds, etc.)
5. Add sound effects and notifications

## API Endpoints (WebSocket Events)

### Client → Server
- `join-room`: Join a game room
- `start-game`: Host starts the game
- `submit-word`: Player submits their word
- `submit-vote`: Player votes for imposter
- `next-round`: Progress to next round

### Server → Client
- `room-update`: Update player list
- `game-started`: Game has begun with word assignment
- `turn-update`: Current player's turn
- `word-submitted`: A word was said
- `voting-phase`: Time to vote
- `round-results`: Voting results and scores
- `game-over`: Final scores

## TypeScript Types (shared)

```typescript
// Player type
interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  hasWhite: boolean;
  isConnected: boolean;
}

// Room type
interface Room {
  id: string;
  players: Player[];
  currentWord: string;
  currentRound: number;
  maxRounds: number;
  gameState: GameState;
  currentTurnPlayerId: string | null;
  submittedWords: WordSubmission[];
  votes: Map<string, string>;
}

type GameState = 'lobby' | 'playing' | 'voting' | 'results' | 'finished';

interface WordSubmission {
  playerId: string;
  word: string;
  timestamp: number;
}

// Socket event types with type safety
interface ServerToClientEvents {
  'room-update': (room: Room) => void;
  'game-started': (word: string) => void;
  'turn-update': (playerId: string) => void;
  'word-submitted': (submission: WordSubmission) => void;
  'voting-phase': () => void;
  'round-results': (results: RoundResults) => void;
  'game-over': (finalScores: PlayerScore[]) => void;
  'error': (message: string) => void;
}

interface ClientToServerEvents {
  'join-room': (data: { roomId: string; playerName: string }) => void;
  'start-game': () => void;
  'submit-word': (word: string) => void;
  'submit-vote': (playerId: string) => void;
  'next-round': () => void;
}
```

## Modern Libraries & Practices

### Backend
- **Fastify**: Modern, fast web framework
- **Socket.io** with TypeScript types
- **Zod**: Runtime type validation
- **Pino**: Structured logging
- **tsx**: Modern TypeScript execution
- **ESLint + Prettier**: Code quality

### Frontend
- **React 18** with concurrent features
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS
- **Zustand**: Lightweight state management
- **Socket.io-client** with TypeScript
- **React Hook Form**: Form handling
- **Framer Motion**: Animations
- **React Query**: Server state management

### Development
- **Turborepo**: Monorepo management (optional)
- **Husky**: Git hooks
- **Commitlint**: Commit message linting
- **GitHub Actions**: CI/CD

## Word List Categories
- Animals
- Foods
- Objects
- Places
- Activities
- Movies
- Books

## Docker Configuration
- Backend container with Node.js 20
- Frontend served via nginx
- docker-compose for orchestration
- Health checks for containers
- Volume mounts for development
- Network configuration for ngrok

## ngrok Configuration

### Local Development Setup
1. **Single Port Exposure**: Expose only the nginx port (80) through ngrok
2. **Dynamic URL Handling**: Frontend detects ngrok URL and configures WebSocket accordingly
3. **Startup Script**: `start.sh` to launch Docker and ngrok together

### start.sh Script
```bash
#!/bin/bash
# Start Docker containers
docker-compose up -d

# Wait for services to be ready
sleep 5

# Start ngrok and display URL
ngrok http 80
```

### Frontend Configuration
- Dynamically detect if running through ngrok
- Automatically configure WebSocket URL based on current hostname
- Handle both local and ngrok connections seamlessly

## Environment Variables
```env
# Backend
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*  # Allow any origin for ngrok
SESSION_SECRET=your-secret-here

# Frontend (handled dynamically for ngrok)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## Security Considerations
- Input validation with Zod
- Rate limiting on socket events
- Room codes instead of sequential IDs
- XSS protection in chat/word submissions
- CORS configuration for ngrok domains
- Environment variable validation

## Deployment Instructions

### Local Hosting with ngrok
1. Install Docker and ngrok
2. Clone the repository
3. Run `./start.sh`
4. Share the ngrok URL with players
5. Players can join from any device on any network

### Production Deployment
1. Deploy to cloud provider (AWS, DigitalOcean, etc.)
2. Configure domain and SSL
3. Update environment variables
4. Use docker-compose production config