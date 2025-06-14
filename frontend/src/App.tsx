import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import { Home } from './views/Home';
import { Lobby } from './views/Lobby';
import { Game } from './views/Game';
import { Voting } from './views/Voting';
import { Results } from './views/Results';
import { GameOver } from './views/GameOver';

function App() {
  const socket = useSocket();
  const room = useGameStore((state) => state.room);
  const isConnected = useGameStore((state) => state.isConnected);
  const error = useGameStore((state) => state.error);
  
  // Render different views based on game state
  const renderView = () => {
    if (!room) {
      return <Home />;
    }
    
    switch (room.gameState) {
      case 'lobby':
        return <Lobby />;
      case 'playing':
        return <Game />;
      case 'voting':
        return <Voting />;
      case 'results':
        return <Results />;
      case 'finished':
        return <GameOver />;
      default:
        return <Home />;
    }
  };
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <>
      {renderView()}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;