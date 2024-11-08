import React, { useState, useEffect } from 'react';
import { initializeProvider, disconnectWallet, getCurrentWalletAddress } from '../utils/web3';
import { playClick2 } from '../utils/feedback';
import './WelcomeScreen.css';

const ICON_TRANSITION_INTERVAL = 250;

const WelcomeScreen = ({ 
  onEnterGame, 
  isConnected, 
  currentWallet,
  onWalletConnect, 
  onWalletDisconnect 
}) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [loadingScale, setLoadingScale] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const icons = [
    '/images/elon-static.png',
    '/images/pepe-static.png',
    '/images/doge-static.png'
  ];

  // Preload images
  useEffect(() => {
    const imagePromises = [
      ...icons,
      '/images/MEMESPIN-H1.png'
    ].map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(error => {
        console.error('Error loading images:', error);
        setImagesLoaded(false);
      });
  }, []);

  // Handle icon animation
  useEffect(() => {
    if (imagesLoaded) {
      let beatCount = 0;
      const beatInterval = setInterval(() => {
        setLoadingScale(scale => scale === 1 ? 1.2 : 1);
        beatCount++;
        if (beatCount === 2) {
          setCurrentIcon(icon => (icon + 1) % icons.length);
          beatCount = 0;
        }
      }, ICON_TRANSITION_INTERVAL);

      return () => clearInterval(beatInterval);
    }
  }, [imagesLoaded]);

  const handleConnect = async () => {
    console.log('handleConnect triggered', { isConnected });
    playClick2();

    if (isConnected) {
      console.log('Already connected, entering game');
      onEnterGame();
    } else {
      setIsConnecting(true);
      try {
        const success = await initializeProvider();
        console.log('Provider initialization result:', success);
        if (success) {
          const address = getCurrentWalletAddress();
          console.log('Connected wallet address:', address);
          if (address) {
            onWalletConnect(address);
            onEnterGame();
          } else {
            console.error('Wallet connected but no address available');
          }
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleDisconnect = async () => {
    console.log('Disconnecting wallet');
    playClick2();
    try {
      await disconnectWallet();
      onWalletDisconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
      window.location.reload();
    }
  };

  return (
    <div className="welcome-container">
      {/* Logo Section */}
      <div className="welcome-section logo-section">
        {!imagesLoaded ? (
          <div className="loading-text text-xl">Loading...</div>
        ) : (
          <img 
            src="/images/MEMESPIN-H1.png" 
            alt="MEMESPIN" 
            className="logo-image noselect"
            draggable="false"
          />
        )}
      </div>

      {/* Character Section */}
      <div className="welcome-section character-section">
        {!imagesLoaded ? (
          <div className="loading-text text-lg pulsing">Loading characters...</div>
        ) : (
          <img 
            src={icons[currentIcon]} 
            alt="Game Character" 
            className="character-image noselect"
            draggable="false"
            style={{ 
              transform: `scale(${loadingScale})`, 
              transition: 'transform 0.25s ease-in-out' 
            }}
          />
        )}
      </div>

      {/* Button Section */}
      <div className="welcome-section button-section">
        {isConnected ? (
          <div className="connected-buttons">
            <button 
              className="chunky-button primary-button"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              Let's Go!
            </button>
            <button 
              className="close-button"
              onClick={handleDisconnect}
              aria-label="Disconnect wallet"
            >
              ×
            </button>
          </div>
        ) : (
          <button 
            className="chunky-button primary-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;