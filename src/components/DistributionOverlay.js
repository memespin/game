import React from 'react';
import { mintNFT } from '../utils/web3';
import { playClick2 } from '../utils/feedback';
import './DistributionOverlay.css';

const DistributionOverlay = ({ isOpen, onClose, gameState, currency, isNFTOwner, onNFTMinted }) => {
  const [isMinting, setIsMinting] = React.useState(false);

  if (!isOpen) return null;

  const totalPlayers = gameState.rockCount + gameState.paperCount + gameState.scissorsCount;
  const elonPercentage = totalPlayers > 0 ? (gameState.rockCount / totalPlayers) * 100 : 33.33;
  const pepePercentage = totalPlayers > 0 ? (gameState.paperCount / totalPlayers) * 100 : 33.33;
  const dogePercentage = totalPlayers > 0 ? (gameState.scissorsCount / totalPlayers) * 100 : 33.34;

  const calculatePredictedWinnings = (choice) => {
    const choiceCount = choice === 'ELON' ? gameState.rockCount : 
                       choice === 'PEPE' ? gameState.paperCount : 
                       gameState.scissorsCount;
    const totalPool = parseFloat(gameState.prizePool);
    
    if (choiceCount === 0) {
      return (totalPool * 0.8).toFixed(3);
    } else {
      const winningPerPlayer = totalPool / choiceCount;
      const winningAfterFee = winningPerPlayer * 0.8;
      return winningAfterFee.toFixed(3);
    }
  };

  const handleMintNFT = async () => {
    playClick2();
    setIsMinting(true);
    try {
      await mintNFT();
      onNFTMinted();
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert("Error minting NFT. Please try again.");
    } finally {
      setIsMinting(false);
    }
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

        <div className="distribution-content">
          <h1 className="distribution-title">Memespin Fan Club</h1>

          {isNFTOwner ? (
            <div className="fan-club-content">
              <section className="distribution-section">
                <h2 className="section-title">Choice Distribution</h2>
                <div className="distribution-bar">
                  <div className="elon" style={{width: `${elonPercentage}%`}}>
                    <span className="percentage">{elonPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="pepe" style={{width: `${pepePercentage}%`}}>
                    <span className="percentage">{pepePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="doge" style={{width: `${dogePercentage}%`}}>
                    <span className="percentage">{dogePercentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="distribution-labels">
                  <span className="elon-label">ELON</span>
                  <span className="pepe-label">PEPE</span>
                  <span className="doge-label">DOGE</span>
                </div>
                <div className="total-players">
                  Total Players: {totalPlayers}
                </div>
              </section>

              <section className="winnings-section">
                <h2 className="section-title">Predicted Winnings</h2>
                <div className="predicted-winnings">
                  <div className="prediction elon">
                    <span className="label">ELON</span>
                    <span className="value">{calculatePredictedWinnings('ELON')} {currency}</span>
                  </div>
                  <div className="prediction pepe">
                    <span className="label">PEPE</span>
                    <span className="value">{calculatePredictedWinnings('PEPE')} {currency}</span>
                  </div>
                  <div className="prediction doge">
                    <span className="label">DOGE</span>
                    <span className="value">{calculatePredictedWinnings('DOGE')} {currency}</span>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="join-content">
              <section className="benefits-section">
                <h2 className="section-title">Benefits</h2>
                <ul className="benefits-list">
                  <li><span className="checkmark">✓</span> Real-time player choice distribution</li>
                  <li><span className="checkmark">✓</span> Live predicted winnings calculation</li>
                  <li><span className="checkmark">✓</span> Exclusive Fan Club updates and features</li>
                  <li><span className="checkmark">✓</span> Early access to new game modes</li>
                </ul>
              </section>
              
              <section className="mint-section">
                <p className="mint-cost">Mint your Fan Club NFT for 50 {currency}</p>
                <button 
                  className="chunky-button mint-button"
                  onClick={handleMintNFT} 
                  disabled={isMinting}
                >
                  {isMinting ? 'Minting...' : 'Mint Fan Club NFT'}
                </button>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributionOverlay;