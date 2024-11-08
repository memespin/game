// App.js

import React, { useState, useEffect } from 'react';
import GameContainer from './components/GameContainer';
import WelcomeScreen from './components/WelcomeScreen';
import { 
  getCurrentWalletAddress, 
  getCurrentChainId,
  fetchGameState 
} from './utils/web3';
import './App.css';

function AppContent() {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial wallet check on mount
  useEffect(() => {
    const initializeApp = async () => {
      const address = getCurrentWalletAddress();
      if (address) {
        console.log('Initial wallet check:', address);
        setIsConnected(true);
        setCurrentWallet(address);
      }
      setIsInitialized(true);
    };
    
    initializeApp();

    // Listen for wallet changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Account changed:', accounts[0]);
        if (accounts[0]) {
          setIsConnected(true);
          setCurrentWallet(accounts[0]);
        } else {
          setIsConnected(false);
          setCurrentWallet(null);
          setShowWelcomeScreen(true);
          setGameState(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // Handle game data loading when wallet connection changes
  useEffect(() => {
    if (isConnected && currentWallet && !showWelcomeScreen) {
      console.log('Loading game data for wallet:', currentWallet);
      const init = async () => {
        setIsDataLoading(true);
        await loadGameData();
      };
      init();
    }
  }, [isConnected, currentWallet, showWelcomeScreen]);

  // Game data refresh interval
  useEffect(() => {
    let interval;
    if (isConnected && currentWallet && !showWelcomeScreen) {
      interval = setInterval(() => {
        loadGameData();
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, currentWallet, showWelcomeScreen]);

  const loadGameData = async () => {
    if (!isConnected || !currentWallet) {
      console.log('Cannot load game data: no wallet connected');
      return;
    }
    
    try {
      const state = await fetchGameState(currentWallet);
      if (state) {
        setGameState(state);
      }
    } catch (error) {
      console.error("Error loading game data:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleEnterGame = () => {
    console.log('handleEnterGame called', { isConnected, currentWallet });
    const address = getCurrentWalletAddress();
    
    if (address && isConnected) {
      console.log('Entering game with wallet:', address);
      setCurrentWallet(address);
      setShowWelcomeScreen(false);
    } else {
      console.log('Cannot enter game: wallet not properly connected');
    }
  };

  const handleWalletConnection = (address) => {
    console.log('Handling wallet connection:', address);
    if (address) {
      setIsConnected(true);
      setCurrentWallet(address);
    }
  };

  const handleWalletDisconnection = () => {
    console.log('Handling wallet disconnection');
    setIsConnected(false);
    setCurrentWallet(null);
    setShowWelcomeScreen(true);
    setGameState(null);
    setIsDataLoading(false);
  };

  // Don't render until we've checked initial wallet state
  if (!isInitialized) {
    return null;
  }

  return (
    <div className="App">
      <div className="background-gradient"></div>
      <div className="game-wrapper">
        <div className="game-content">
          {showWelcomeScreen ? (
            <WelcomeScreen 
              onEnterGame={handleEnterGame}
              gameState={gameState}
              isConnected={isConnected}
              currentWallet={currentWallet}
              onWalletConnect={handleWalletConnection}
              onWalletDisconnect={handleWalletDisconnection}
            />
          ) : (
            <GameContainer 
              isLoading={isDataLoading} 
              gameState={gameState} 
              onUpdateGameState={loadGameData}
              isConnected={isConnected}
              currentWallet={currentWallet}
            />
          )}
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;