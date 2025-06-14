# White - The Word Game

A multiplayer word game where players receive the same word except one player who gets "White". Players take turns saying related words without revealing the original word, then vote on who the imposter is.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- ngrok (for sharing with remote players)

### Running Locally

1. Clone the repository
2. Run the game:
   ```bash
   ./start.sh
   ```
3. Share the ngrok URL with your players

## Development

### Setup
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../shared && npm install
```

### Running in Development Mode
```bash
docker-compose -f docker-compose.dev.yml up
```

## Game Rules

1. **Minimum 3 players** required to start
2. Each player receives the same word, except one who gets "White"
3. Players take turns saying one word related to the theme
4. After all players have spoken, everyone votes on who has "White"
5. Points are awarded for correct guesses
6. Game continues for multiple rounds

## Tech Stack

- **Backend**: Node.js, TypeScript, Fastify, Socket.io
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Infrastructure**: Docker, ngrok