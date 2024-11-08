import React, { useState } from 'react';
import { fetchRoundHistory, getCurrentWalletAddress  } from '../utils/web3';
import { playClick2 } from '../utils/feedback';
import './SettingsOverlay.css';

const SettingsOverlay = ({ isOpen, onClose, gameState, currency, showEndRound, onEndRound }) => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);

  if (!isOpen) return null;

  // const handleDisconnect = async () => {
  //   playClick2();
  //   try {
  //     await disconnectWallet();
  //     localStorage.clear();
  //     window.location.reload();
  //   } catch (error) {
  //     console.error('Error disconnecting:', error);
  //     localStorage.clear();
  //     window.location.reload();
  //   }
  // };

  const handleContactClick = () => {
    playClick2();
    window.open('https://x.com/memespin_io', '_blank');
  };

  const handleLoadHistory = async () => {
    playClick2();
    setIsLoadingHistory(true);
    try {
      const address = getCurrentWalletAddress();
      if (!address) {
        throw new Error('No wallet connected');
      }
      const history = await fetchRoundHistory(address, gameState.currentRoundId);
      setRoundHistory(history);
    } catch (error) {
      console.error('Error loading round history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // const shortenAddress = (addr) => {
  //   return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  // };

  const formatReward = (amount) => {
    return parseFloat(amount).toFixed(3);
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        <button 
          className="button popup-close-button"
          onClick={() => {
            playClick2();
            onClose();
          }}
        >
          <img 
            src="/images/close.png" 
            alt="Close" 
            className="button-icon noselect"
            draggable="false"
          />
        </button>

        <div className="settings-content">
          <h1 className="settings-title">Settings</h1>

          <section className="settings-section">
            <h2 className="settings-section-title">Support</h2>
            <div className="support-buttons">
              <button 
                className="chunky-button"
                onClick={handleContactClick}
              >
                Contact Us
              </button>
              {showEndRound && (
                <button 
                  className="chunky-button"
                  onClick={() => {
                    playClick2();
                    onEndRound();
                  }}
                >
                  End Round
                </button>
              )}
            </div>
          </section>

          <section className="settings-section">
            <h2 className="settings-section-title">Round History</h2>
            <button 
              className="chunky-button"
              onClick={handleLoadHistory}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? 'Loading...' : 'Load History'}
            </button>
            
            {roundHistory.length > 0 ? (
              <ul className="history-list">
                {roundHistory.map((round, index) => (
                  <li key={index} className="history-item">
                    <div className="history-left">
                      <span className="round-number">Round {round.id}</span>
                      <span className={`result ${round.result.toLowerCase()}`}>{round.result}</span>
                    </div>
                    <div className="history-right">
                      {round.result !== 'Lose' && parseFloat(round.reward) > 0 && (
                        <span className="reward-amount">
                          {formatReward(round.reward)} {currency}
                        </span>
                      )}
                      {!round.hasClaimed && round.result !== 'Lose' && 
                       parseFloat(round.reward) > 0 && (
                        <span className="unclaimed">Unclaimed</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-history">
                {isLoadingHistory ? 'Loading history...' : 'No round history available.'}
              </div>
            )}
          </section>

          <footer className="settings-footer">
            <div className="attribution">
              Twitter X version powered by{' '}
              <a 
                href="https://www.winks.fun/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="winks-link"
              >
                Winks.fun
              </a>
            </div>
            <div className="copyright">
            <br></br>
              © 2024 Memespin. All rights reserved. The Memespin game is a parody and fan creation. 
              It is not affiliated with, endorsed by, or connected to Elon Musk, Pepe the Frog, 
              or Dogecoin. All character likenesses are used for entertainment purposes only.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;