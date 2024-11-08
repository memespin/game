import React, { useState, useEffect, useRef } from 'react';
import SpinWheel from './SpinWheel';
import DistributionOverlay from './DistributionOverlay';
import SettingsOverlay from './SettingsOverlay';
import './GameContainer.css';
import { getCurrentWalletAddress, playGame, endRound, claimRewards, checkNFTOwnership } from '../utils/web3';
import { playClick2, playHornSound } from '../utils/feedback';
import Confetti from 'react-confetti';

const ICON_TRANSITION_INTERVAL = 250;
const PRIZE_POOL_ANIMATION_DURATION = 2000;
const PRIZE_POOL_ANIMATION_ELASTICITY = 0.3;
const CONFETTI_DURATION = 10000;
const CONFETTI_PIECES = 1000;

const GameContainer = ({ isLoading, gameState, onUpdateGameState }) => {
  // State Management
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentChoice, setCurrentChoice] = useState('');
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(true);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [isWaitingForResults, setIsWaitingForResults] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [prevRoundId, setPrevRoundId] = useState(null);
  const [prevPlayerChoice, setPrevPlayerChoice] = useState(null);
  const [lastPlayedRound, setLastPlayedRound] = useState(null);
  const [resultPopupClosed, setResultPopupClosed] = useState(false);
  const [isPlayDisabled, setIsPlayDisabled] = useState(false);
  const [isClaimDisabled, setIsClaimDisabled] = useState(false);
  const [localGameState, setLocalGameState] = useState(null);
  const [displayPrizePool, setDisplayPrizePool] = useState('0');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiColors, setConfettiColors] = useState(['#e74eaa', '#45e46d', '#f48229']);
  const [isNFTOwner, setIsNFTOwner] = useState(false);
  const [currentLoadingIcon, setCurrentLoadingIcon] = useState(0);
  const [loadingScale, setLoadingScale] = useState(1);
  const [showClaimedPopup, setShowClaimedPopup] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [canInitiateSpin, setCanInitiateSpin] = useState(false);
  const [shouldStartInitialSpin, setShouldStartInitialSpin] = useState(false);

  // Refs
  const prizePoolRef = useRef(null);
  const animationFrameRef = useRef(null);
  const spinInitiatedRef = useRef(false);

  const loadingIcons = [
    '/images/elon-static.png',
    '/images/pepe-static.png',
    '/images/doge-static.png'
  ];

  // Utility Functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(3);
  };

  // Effect: Load Images
  useEffect(() => {
    const imagePromises = [
      ...loadingIcons,
      '/images/nftclub.png',
      '/images/setting.png',
      '/images/close.png'
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

  // Effect: Loading Animation
  useEffect(() => {
    if (isLoading) {
      let beatCount = 0;
      const beatInterval = setInterval(() => {
        setLoadingScale(scale => scale === 1 ? 1.2 : 1);
        beatCount++;
        if (beatCount === 2) {
          setCurrentLoadingIcon(icon => (icon + 1) % loadingIcons.length);
          beatCount = 0;
        }
      }, ICON_TRANSITION_INTERVAL);

      return () => clearInterval(beatInterval);
    }
  }, [isLoading]);

  // Effect: Game State Management
  useEffect(() => {
    if (gameState) {
      setLocalGameState(gameState);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
        if (gameState.playerChoice) {
          setIsWaitingForResults(true);
          setPrevPlayerChoice(gameState.playerChoice);
          setLastPlayedRound(gameState.currentRoundId);
          setShowStatusInfo(true);
        }
      }
      animatePrizePool(gameState.prizePool);
    }
  }, [gameState, initialLoadComplete]);

  // Effect: Handle Rules Popup Close and Initial Spin
  useEffect(() => {
    if (!showRulesPopup && shouldStartInitialSpin && !spinInitiatedRef.current) {
      setCanInitiateSpin(true);
      spinInitiatedRef.current = true;
      setShouldStartInitialSpin(false);
    }
  }, [showRulesPopup, shouldStartInitialSpin]);

  // Effect: Time and Round Management
  useEffect(() => {
    if (localGameState) {
      const now = Math.floor(Date.now() / 1000);
      const newTimeRemaining = Math.max(0, localGameState.endTime - now);
      setTimeRemaining(newTimeRemaining);
      
      if (localGameState.currentRoundId !== prevRoundId) {
        if (prevRoundId !== null && isWaitingForResults) {
          updateResultPopup();
        }
        setPrevRoundId(localGameState.currentRoundId);
      }

      if (isWaitingForResults && localGameState.previousRound && 
          localGameState.previousRound.roundId === lastPlayedRound) {
        updateResultPopup();
      }
    }
  }, [localGameState, isWaitingForResults, prevRoundId, lastPlayedRound]);

// Effect: NFT Ownership Check
useEffect(() => {
  const checkNFTStatus = async () => {
    const address = getCurrentWalletAddress();
    if (address) {
      const ownsNFT = await checkNFTOwnership(address);
      setIsNFTOwner(ownsNFT);
    }
  };
  checkNFTStatus();
}, []);

// Effect: Timer
useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(prevTime => Math.max(0, prevTime - 1));
  }, 1000);
  return () => clearInterval(timer);
}, []);

const animatePrizePool = (targetValue) => {
  if (prizePoolRef.current === null) {
    prizePoolRef.current = parseFloat(displayPrizePool);
  }

  const startValue = prizePoolRef.current;
  const startTime = Date.now();

  const animate = () => {
    const now = Date.now();
    const progress = Math.min((now - startTime) / PRIZE_POOL_ANIMATION_DURATION, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3 + PRIZE_POOL_ANIMATION_ELASTICITY);
    
    const currentValue = startValue + (targetValue - startValue) * easedProgress;
    setDisplayPrizePool(formatAmount(currentValue));

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      prizePoolRef.current = parseFloat(targetValue);
    }
  };

  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
  }

  animationFrameRef.current = requestAnimationFrame(animate);
};

const triggerConfetti = () => {
  setShowConfetti(true);
  playHornSound();
  setTimeout(() => setShowConfetti(false), CONFETTI_DURATION);
};

const updateResultPopup = () => {
  if (localGameState && localGameState.previousRound && 
      localGameState.previousRound.roundId === lastPlayedRound) {
    const prevRound = localGameState.previousRound;
    setLastRoundResult({
      result: prevRound.playerResult,
      reward: prevRound.playerReward,
      choice: prevRound.playerChoice,
      roundId: prevRound.roundId
    });
    if (!resultPopupClosed) {
      setShowResultPopup(true);
      setShowSharePopup(false);
      if (prevRound.playerResult === 'Win' || prevRound.playerResult === 'Draw') {
        triggerConfetti();
      }
    }
    if (prevRound.playerResult !== 'Pending') {
      setIsWaitingForResults(false);
    }
  }
};

const handlePlay = async () => {
  playClick2();
  if (currentChoice && !localGameState.playerChoice && !isPlayDisabled) {
    setIsPlayDisabled(true);
    try {
      const referrer = getReferrerFromUrl() || localGameState.dev1Address;
      await playGame(currentChoice, referrer);
      setIsWaitingForResults(true);
      setPrevPlayerChoice(currentChoice);
      setLastPlayedRound(localGameState.currentRoundId);
      setShowSharePopup(true);
      setResultPopupClosed(false);
      setShowStatusInfo(true);
      setLocalGameState(prevState => ({
        ...prevState,
        playerChoice: currentChoice,
        roundStatus: 'Active'
      }));
      onUpdateGameState();
      triggerConfetti();
    } catch (error) {
      console.error("Error playing:", error);
      alert(error.message || "An error occurred while trying to play. Please try again.");
    }
    setIsPlayDisabled(false);
  }
};

const handleEndRound = async () => {
  playClick2();
  try {
    await endRound();
    onUpdateGameState();
  } catch (error) {
    console.error("Error ending round:", error);
    alert("An error occurred while trying to end the round. Please try again.");
  }
};

const handleClaim = async () => {
  playClick2();
  if (!isClaimDisabled && localGameState && localGameState.roundHistory) {
    setIsClaimDisabled(true);
    try {
      const claimableRounds = localGameState.roundHistory
        .filter(round => round.result !== 'Pending' && !round.hasClaimed)
        .map(round => round.id);
      
      if (claimableRounds.length === 0) {
        console.log("No rounds to claim");
        alert("There are no rewards to claim at this time.");
        return;
      }

      await claimRewards(claimableRounds);
      
      // Calculate total claimed amount from history
      const totalClaimed = localGameState.roundHistory
        .filter(round => claimableRounds.includes(round.id))
        .reduce((sum, round) => sum + parseFloat(round.reward), 0);
      
      onUpdateGameState();
      triggerConfetti();
      setClaimedAmount(formatAmount(totalClaimed)); // Use the same formatAmount function you use elsewhere
      setShowClaimedPopup(true);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      alert(error.message || "An error occurred while trying to claim rewards. Please try again.");
    }
    setIsClaimDisabled(false);
  }
};

const handleShare = () => {
  playClick2();
  const choiceHashtag = currentChoice === 'ELON' ? '#ELON 👨‍🦰' : 
                       currentChoice === 'PEPE' ? '#PEPE 🐸' : '#DOGE 🐶';
  const address = getCurrentWalletAddress();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `LFG team ${choiceHashtag}! Play with me at - https://memespin.io/?r=${address}`
  )}`;
  window.open(twitterUrl, '_blank');
};

const getReferrerFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = urlParams.get('r');
  if (referrer && referrer.length === 42 && referrer.startsWith('0x') && 
      /^0x[a-fA-F0-9]{40}$/.test(referrer)) {
    return referrer;
  }
  return null;
};

const handleChoiceSelect = (choice) => {
  setCurrentChoice(choice);
};

const getPlayButtonText = () => {
  if (!getCurrentWalletAddress()) {
    return 'Connect';
  }
  if (localGameState.playerChoice) {
    return 'Waiting';
  }
  if (!currentChoice) {
    return 'Pick Choice';
  }
  return `${currentChoice} (${formatAmount(localGameState.playCost)})`;
};

// Loading Screen Render
if (isLoading || !localGameState) {
  return (
    <div className="loading-screen">
      <div className="loading-icon-container">
        {!imagesLoaded ? (
          <div className="loading-text text-xl">Loading game...</div>
        ) : (
          <img
            src={loadingIcons[currentLoadingIcon]}
            alt="Loading"
            className="loading-icon noselect"
            draggable="false"
            style={{ transform: `scale(${loadingScale})` }}
          />
        )}
      </div>
    </div>
  );
}

return (
  <>
    <div className="game-content">
      <div className="scale-container">
        {/* Top Panel */}
        <div className="game-panel top-panel">
          {/* Progress Section */}
          <div className="info-box progress-section">
            <div className="progress-bar-group">
              <div className="bar-label">Time</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill time-fill" 
                  style={{
                    width: `${(localGameState.roundDuration - timeRemaining) / 
                            localGameState.roundDuration * 100}%`
                  }}
                ></div>
                <span className="progress-text">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <div className="progress-bar-group">
              <div className="bar-label">Players</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill player-fill" 
                  style={{
                    width: `${localGameState.playersInRound / 
                            localGameState.maxPlayers * 100}%`
                  }}
                ></div>
                <span className="progress-text">
                  {localGameState.playersInRound}/{localGameState.maxPlayers}
                </span>
              </div>
            </div>
          </div>

          {/* Prize Section */}
          <div className="info-box prize-section">
            <div className="prize-pool">
              <span className="prize-label">Prize Pool:</span>
              <span className="prize-amount">{formatAmount(displayPrizePool)} POL</span>
            </div>
            <button 
              className={`chunky-button play-button ${currentChoice.toLowerCase()} ${
                isPlayDisabled ? 'disabled' : ''
              }`}
              onClick={handlePlay}
              disabled={!getCurrentWalletAddress() || localGameState.playerChoice || isPlayDisabled}
            >
              {getPlayButtonText()}
            </button>
          </div>

          {/* Rewards Section */}
          <div className="info-box rewards-section">
            <div className="rewards-info">
              <div className="info-label">Rewards</div>
              <div className="info-value">
                {formatAmount(localGameState.pendingRewards)} POL
              </div>
            </div>
            <button 
              className={`chunky-button claim-button ${isClaimDisabled ? 'disabled' : ''}`}
              onClick={handleClaim}
              disabled={parseFloat(localGameState.pendingRewards) === 0 || isClaimDisabled}
            >
              Claim Now
            </button>
          </div>
        </div>

        {/* Main Game Panel */}
        <div className="game-panel main-panel">
        {/* Utility Buttons */}
        <div className="utility-buttons">
          <button 
            className="button circle-button"
            onClick={() => {
              playClick2();
              setIsDistributionOpen(true);
            }}
          >
            <img 
              src="/images/nftclub.png" 
              alt="Fan Club" 
              className="button-icon noselect"
              draggable="false"
            />
          </button>
          
          <button 
            className="button circle-button"
            onClick={() => {
              playClick2();
              setIsSettingsOpen(true);
            }}
          >
            <img 
              src="/images/setting.png" 
              alt="Settings" 
              className="button-icon noselect"
              draggable="false"
            />
          </button>
        </div>

          {/* Status Info */}
          {showStatusInfo && (
            <div className="status-info">
              <div className="status-info-row">
                <span className="status-label"><strong>Round:  </strong></span>
                <span className="status-value">{localGameState.currentRoundId}<br></br></span>
                <span className="status-label"><strong>Status:  </strong></span>
                <span className="status-value">{localGameState.roundStatus}<br></br></span>
              </div>
              <div className="status-info-row">
                <span className="status-label"><strong>Choice:  </strong></span>
                <span className="status-value highlight">{localGameState.playerChoice}<br></br></span>
                {localGameState.playerResult && localGameState.playerResult !== 'Pending' && (
                  <>
                    <span className="status-label"><strong>Result:  </strong></span>
                    <span className={`status-value ${localGameState.playerResult.toLowerCase()}`}>
                      {localGameState.playerResult}
                    </span>
                    {parseFloat(localGameState.playerReward) > 0 && (
                      <span className="status-value highlight">
                        +{formatAmount(localGameState.playerReward)} POL
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Spin Wheel */}
          <div className="spin-wheel-wrapper">
            <SpinWheel 
              onChoiceSelect={handleChoiceSelect} 
              currentRoundStatus={localGameState.roundStatus} 
              playerChoice={localGameState.playerChoice}
              canInitiateSpin={!showRulesPopup}
            />
          </div>
        </div>
      </div>
    </div>

    <div className="overlay-container">
      {/* Rules Popup */}
      {showRulesPopup && (
        <div className="popup-overlay">
          <div className="popup rules-popup">
            <button 
              className="button popup-close-button"
              onClick={() => {
                playClick2();
                setShowRulesPopup(false);
              }}
            >
              <img 
                src="/images/close.png" 
                alt="Close" 
                className="button-icon noselect"
                draggable="false"
              />
            </button>
            <div className="popup-content">
              <h2 className="popup-header">Game Rules</h2>
              <div className="rules-section">
                <div className="game-rules">
                  <p className="rules-text">
                    Doge <strong><font color="#f48229">EATS</font></strong> Pepe<br></br>
                    Pepe <strong><font color="#45e46d">SCARES</font></strong> Elon<br></br>
                    Elon <strong><font color="#e74eaa">WALKS</font></strong> Doge<br></br>
                  </p>
                  <p className="rules-text">
                    Winners <strong><font color="#732eff">share the prize</font></strong> pool<br></br>
                    Draws <strong><font color="#732eff">get half payment</font></strong> back<br></br>
                    Losers <strong><font color="#732eff">try again</font></strong> next round<br></br>
                  </p>
                  <p className="rules-text">
                      Memespin is still in beta testing<br></br>
                      Please report bugs to our Twitter X 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Popup */}
      {showSharePopup && (
        <div className="popup-overlay">
          <div className="popup share-popup">
            <button 
              className="button popup-close-button"
              onClick={() => {
                playClick2();
                setShowSharePopup(false);
              }}
            >
              <img 
                src="/images/close.png" 
                alt="Close" 
                className="button-icon noselect"
                draggable="false"
              />
            </button>
            <div className="popup-content">
              <h2 className="popup-header">Share Your Choice!</h2>
              <p className="share-text">
                Share your choice on Twitter X for extra rewards!
              </p>
              <button 
                className="chunky-button share-button"
                onClick={handleShare}
              >
                Share on Twitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Popup */}
      {showResultPopup && lastRoundResult && (
        <div className="popup-overlay">
          <div className="popup result-popup">
            <button 
              className="button popup-close-button"
              onClick={() => {
                playClick2();
                setShowResultPopup(false);
                setResultPopupClosed(true);
              }}
            >
              <img 
                src="/images/close.png" 
                alt="Close" 
                className="button-icon noselect"
                draggable="false"
              />
            </button>
            <div className="popup-content">
              <h2 className="popup-header">Round Results #{lastRoundResult.roundId}</h2>
              <div className="result-content">
                <div className="result-row">
                  <span className="result-label"><strong>Choice:  </strong></span>
                  <span className="result-value">{lastRoundResult.choice}</span>
                </div>
                <div className="result-row">
                  <span className="result-label"><strong>Result:  </strong></span>
                  <span className={`result-value ${lastRoundResult.result.toLowerCase()}`}>
                    {lastRoundResult.result}
                  </span>
                </div>
                {lastRoundResult.result !== 'Pending' && parseFloat(lastRoundResult.reward) > 0 && (
                  <div className="result-row">
                    <span className="result-label">Reward:</span>
                    <span className="result-value highlight">
                      +{formatAmount(lastRoundResult.reward)} POL
                    </span>
                  </div>
                )}
              </div>
              {lastRoundResult.result === 'Pending' && timeRemaining === 0 && (
                <button 
                  className="chunky-button speed-up-button"
                  onClick={handleEndRound}
                >
                  Speed Up Result
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claimed Popup */}
      {showClaimedPopup && (
        <div className="popup-overlay">
          <div className="popup claimed-popup">
            <button 
              className="button popup-close-button"
              onClick={() => {
                playClick2();
                setShowClaimedPopup(false);
              }}
            >
              <img 
                src="/images/close.png" 
                alt="Close" 
                className="button-icon noselect"
                draggable="false"
              />
            </button>
            <div className="popup-content">
              <h2 className="popup-header">Rewards Claimed!</h2>
              <div className="claimed-amount">
                +{formatAmount(claimedAmount)} POL
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      <DistributionOverlay 
        isOpen={isDistributionOpen}
        onClose={() => {
          playClick2();
          setIsDistributionOpen(false);
        }}
        gameState={localGameState}
        currency="POL"
        isNFTOwner={isNFTOwner}
        onNFTMinted={() => {
          setIsNFTOwner(true);
          onUpdateGameState();
        }}
      />

      <SettingsOverlay 
        isOpen={isSettingsOpen}
        onClose={() => {
          playClick2();
          setIsSettingsOpen(false);
        }}
        gameState={localGameState}
        currency="POL"
        showEndRound={timeRemaining === 0 || 
                     localGameState.playersInRound >= localGameState.maxPlayers}
        onEndRound={handleEndRound}
      />

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={CONFETTI_PIECES}
          gravity={0.1}
          colors={confettiColors}
        />
      )}
    </div>
  </>
);
};

export default GameContainer;