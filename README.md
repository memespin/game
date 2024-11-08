# Memespin

A modern, Web3-enabled ELON PEPE DOGE game with a twist!

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Smart Contract](#smart-contract)
5. [Frontend Development](#frontend-development)
   - [Setup](#frontend-setup)
   - [Utilities](#utils)
   - [Components](#components)
   - [Styling](#styling)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Usage](#usage)
9. [Troubleshooting](#troubleshooting)

## Overview

Memespin is an exciting blockchain-based game that brings a new twist to the classic ELON PEPE DOGE. Players from all over the world can join in timed rounds, making their choices and competing for a shared prize pool.

Here's how it works:

1. **Join a Round**: Every few minutes, a new round begins. You can join at any time before the round ends.
2. **Make Your Choice**: Pay a small fee to play and choose ELON, PEPE, or DOGE using the spin wheel.
3. **Share to See**: Share the game on Twitter to reveal the current distribution of choices and predicted winnings.
4. **Round Ends**: When the timer hits zero, no more choices can be made.
5. **Winner Revealed**: The game randomly selects ELON, PEPE, or DOGE as the winning choice for the round.
6. **Rewards Distributed**: If you picked the winning choice, you share the prize pool with other winners. If it's a draw, you get half of your payment back. If you lose, better luck next time!
7. **Claim Your Winnings**: With a single click, you can claim all your winnings from multiple rounds.

The game features a unique referral system where influencers (KOLs) can earn a portion of the fees from players they bring to the game.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Git
- MetaMask or any Web3 wallet
- Basic knowledge of React, Web3 development, and Solidity

## Project Structure

The project is organized into the following structure:

```
memespin/
├── .gitignore
├── README.md
├── package.json
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── sounds/
│   │   ├── click1.mp3
│   │   ├── click2.mp3
│   │   └── horn1.mp3
│   └── images/
│       ├── elon-base.png
│       ├── elon-static.png
│       ├── pepe-base.png
│       ├── pepe-static.png
│       ├── doge-base.png
│       ├── doge-static.png
│       ├── MEMESPIN-H1.png
│       └── wheel.png
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   ├── index.css
│   ├── components/
│   │   ├── GameContainer.js
│   │   ├── GameContainer.css
│   │   ├── SpinWheel.js
│   │   ├── SpinWheel.css
│   │   ├── DistributionOverlay.js
│   │   ├── DistributionOverlay.css
│   │   ├── SettingsOverlay.js
│   │   ├── SettingsOverlay.css
│   │   ├── WelcomeScreen.js
│   │   └── WelcomeScreen.css
│   └── utils/
│       ├── web3.js
│       ├── feedback.js
│       ├── NFT_ABI.json
│       └── ABI.json
└── contracts/
    ├── RPS.sol
    └── MSF.sol
```

## Smart Contract

### RPS.sol
```
```

### MSF.sol
```
```

## Frontend Development

### Frontend Setup

1. Navigate to the project directory and install dependencies:
   ```
   npm install @walletconnect/ethereum-provider ethers@^5.7.2 react react-dom react-confetti react-scripts
   ```

2. Configure your contract addresses and chain in `/public/config.js`:
   ```javascript
   window.ENV = {
   CONTRACT_ADDRESS: '0x8Ce50535f749b1d6924b4777f58c6d30eD751E01',
   NFT_CONTRACT_ADDRESS: '0x779E468f92d2722F428C6Bf283428933aDA88BEe',
   CHAIN_ID: '80002', // Polygon Amoy
   };

3. Ensure your public/index.html includes the config script:
   ```html
   <script src="%PUBLIC_URL%/config.js"></script>
   ```

3. Start the development server:
   ```
   npm start
   ```

### Utils

#### web3.js
```javascript
/**
 * web3.js - Universal Web3 Connection Manager
 * Handles all blockchain interactions for Memespin across all devices and wallets
 */

import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import ABI from './ABI.json';
import NFT_ABI from './NFT_ABI.json';

// Core configuration
const CONFIG = {
    WALLET_CONNECT_PROJECT_ID: 'b563e6e9697abbb05502b830f7d0c503',
    INFURA_ID: '65466506adfd40bb907fe06722bc70de',
    CONNECTION_TIMEOUT: 15000,
    RPC_RETRY_ATTEMPTS: 3,
    RPC_RETRY_DELAY: 1000,
    CONTRACT_ADDRESS: window.ENV.CONTRACT_ADDRESS,
    NFT_CONTRACT_ADDRESS: window.ENV.NFT_CONTRACT_ADDRESS,
    CHAIN_ID: window.ENV.CHAIN_ID,
    APP_NAME: 'Memespin',
    APP_URL: 'https://memespin.io',
    DEEP_LINK: {
        native: "memespin://",
        universal: "https://memespin.io"
    }
};

// Connection states
const WalletState = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error'
};

// Custom error types
class WalletError extends Error {
    constructor(message, code, originalError = null) {
        super(message);
        this.name = 'WalletError';
        this.code = code;
        this.originalError = originalError;
    }
}

// Chain configurations with separate public and private RPCs
const chainConfigs = {
    '137': {
        name: 'Polygon',
        chain: 'Polygon',
        networkType: 'mainnet',
        networkId: 137,
        shortName: 'pol',
        nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18
        },
        rpcUrls: [
            'https://polygon-rpc.com',
            'https://rpc.ankr.com/polygon',
            'https://polygon-bor.publicnode.com',
            'https://1rpc.io/matic'
        ],
        privateRpcUrls: [
            `https://polygon-mainnet.infura.io/v3/${CONFIG.INFURA_ID}`
        ],
        blockExplorerUrls: ['https://polygonscan.com'],
        explorers: [{
            name: 'PolygonScan',
            url: 'https://polygonscan.com',
            standard: 'EIP3091'
        }]
    },
    '80002': {
        name: 'Amoy',
        chain: 'Polygon',
        networkType: 'testnet',
        networkId: 80002,
        shortName: 'amoy',
        nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18
        },
        rpcUrls: [
            'https://rpc.ankr.com/polygon_amoy',
            'https://polygon-amoy.drpc.org',
            'https://polygon-amoy.public-rpc.com'
        ],
        privateRpcUrls: [
            `https://polygon-amoy.infura.io/v3/${CONFIG.INFURA_ID}`
        ],
        blockExplorerUrls: ['https://www.oklink.com/amoy'],
        explorers: [{
            name: 'OKLink',
            url: 'https://www.oklink.com/amoy',
            standard: 'EIP3091'
        }]
    },
    '8453': {
        name: 'Base',
        chain: 'Base',
        networkType: 'mainnet',
        networkId: 8453,
        shortName: 'base',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: [
            'https://base.publicnode.com',
            'https://base.meowrpc.com',
            'https://1rpc.io/base',
            'https://base.drpc.org'
        ],
        privateRpcUrls: [
            `https://base-mainnet.infura.io/v3/${CONFIG.INFURA_ID}`
        ],
        blockExplorerUrls: ['https://basescan.org'],
        explorers: [{
            name: 'BaseScan',
            url: 'https://basescan.org',
            standard: 'EIP3091'
        }]
    },
    '84532': {
        name: 'Base Sepolia',
        chain: 'Base',
        networkType: 'testnet',
        networkId: 84532,
        shortName: 'base-sepolia',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: [
            'https://sepolia.base.org',
            'https://base-sepolia-rpc.publicnode.com',
            'https://base-sepolia.drpc.org'
        ],
        privateRpcUrls: [
            `https://base-sepolia.infura.io/v3/${CONFIG.INFURA_ID}`
        ],
        blockExplorerUrls: ['https://sepolia.basescan.org'],
        explorers: [{
            name: 'BaseScan Sepolia',
            url: 'https://sepolia.basescan.org',
            standard: 'EIP3091'
        }]
    }
};

/**
 * Universal Wallet Connection Manager
 */
class WalletConnection {
  constructor() {
      // Core state
      this.state = WalletState.DISCONNECTED;
      this.provider = null;
      this.contract = null;
      this.nftContract = null;
      this.currentWallet = null;
      this.wcProvider = null;
      this.isInitialized = false;
      this.cachedRoundHistory = null;
      
      // Event handling
      this.listeners = new Set();
      this.lastError = null;
      
      // Platform detection
      this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Bind methods
      this.connect = this.connect.bind(this);
      this.disconnect = this.disconnect.bind(this);
      this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  // Event system
  addListener(listener) {
      this.listeners.add(listener);
  }

  removeListener(listener) {
      this.listeners.delete(listener);
  }

  emit(event, data) {
      this.listeners.forEach(listener => {
          if (listener[event]) {
              listener[event](data);
          }
      });
  }

  /**
   * RPC Connection Management
   * Handles RPC connections with private/public fallback system
   */
  async connectToRPC(retries = CONFIG.RPC_RETRY_ATTEMPTS) {
      // Try private RPC first
      const privateRpcUrl = chainConfigs[CONFIG.CHAIN_ID].privateRpcUrls[0];
      try {
          const rpcProvider = new ethers.providers.JsonRpcProvider(privateRpcUrl);
          await rpcProvider.getBlockNumber();
          console.log('Connected to private RPC');
          return rpcProvider;
      } catch (error) {
          console.log('Private RPC failed, falling back to public RPCs');
      }

      // Fall back to public RPCs
      const urls = chainConfigs[CONFIG.CHAIN_ID].rpcUrls;
      let lastError;
      
      for (let attempt = 0; attempt < retries; attempt++) {
          for (const url of urls) {
              try {
                  const rpcProvider = new ethers.providers.JsonRpcProvider(url);
                  await rpcProvider.getBlockNumber();
                  console.log(`Connected to public RPC: ${url}`);
                  return rpcProvider;
              } catch (error) {
                  console.log(`Failed to connect to RPC ${url}:`, error.message);
                  lastError = error;
                  continue;
              }
          }
          if (attempt < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, CONFIG.RPC_RETRY_DELAY));
          }
      }
      throw new WalletError('All RPC connections failed', 'RPC_FAILURE', lastError);
  }

  /**
   * Chain Management
   * Handles chain switching and addition across different wallet types
   */
  async switchToChain(walletProvider, targetChainId) {
      const hexChainId = `0x${parseInt(targetChainId).toString(16)}`;
      
      try {
          // Try switching chain first
          await walletProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: hexChainId }]
          });
          return true;
      } catch (error) {
          // Handle chain addition if needed
          if (error.code === 4902 || error.code === -32603) {
              try {
                  const chainConfig = chainConfigs[targetChainId];
                  if (!chainConfig) {
                      throw new WalletError(
                          'Chain configuration not found',
                          'INVALID_CHAIN'
                      );
                  }

                  // Only use public RPCs when adding chain to user's wallet
                  await walletProvider.request({
                      method: 'wallet_addEthereumChain',
                      params: [{
                          chainId: hexChainId,
                          chainName: chainConfig.name,
                          nativeCurrency: chainConfig.nativeCurrency,
                          rpcUrls: chainConfig.rpcUrls,
                          blockExplorerUrls: chainConfig.blockExplorerUrls
                      }]
                  });
                  return true;
              } catch (addError) {
                  throw new WalletError(
                      'Failed to add chain',
                      'CHAIN_ADD_FAILED',
                      addError
                  );
              }
          }
          throw new WalletError(
              'Failed to switch chain',
              'CHAIN_SWITCH_FAILED',
              error
          );
      }
  }

  /**
   * Connection timeout wrapper
   */
  async connectWithTimeout(connectionPromise) {
      let timeoutId;
      
      const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
              reject(new WalletError(
                  'Connection timeout',
                  'CONNECTION_TIMEOUT'
              ));
          }, CONFIG.CONNECTION_TIMEOUT);
      });

      try {
          const result = await Promise.race([connectionPromise, timeoutPromise]);
          clearTimeout(timeoutId);
          return result;
      } catch (error) {
          clearTimeout(timeoutId);
          throw error;
      }
  }

/**
     * Injected Wallet Connection
     * Handles MetaMask, Coinbase Wallet, Trust Wallet, etc.
     */
async connectInjected() {
  // Get the appropriate provider
  const provider = window.ethereum ||
                  window.coinbaseWallet ||
                  window.trustWallet;
                  
  if (!provider) {
      throw new WalletError(
          'No injected provider found',
          'NO_PROVIDER'
      );
  }

  try {
      // Connect to RPC first
      await this.connectToRPC();
      
      // Initialize ethers provider
      this.provider = new ethers.providers.Web3Provider(provider);
      
      // Check and switch chain if needed
      const chainId = await provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16).toString();
      
      if (currentChainId !== CONFIG.CHAIN_ID) {
          const switched = await this.switchToChain(provider, CONFIG.CHAIN_ID);
          if (!switched) {
              throw new WalletError(
                  'Failed to switch to correct chain',
                  'CHAIN_SWITCH_FAILED'
              );
          }
          this.provider = new ethers.providers.Web3Provider(provider);
      }

      // Request account access
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (!accounts?.length) {
          throw new WalletError(
              'No accounts returned',
              'NO_ACCOUNTS'
          );
      }

      this.currentWallet = accounts[0];
      console.log('Connected to wallet:', this.currentWallet);

      // Initialize contracts
      const signer = this.provider.getSigner();
      this.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
      this.nftContract = new ethers.Contract(CONFIG.NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

      // Setup event listeners
      this.setupEventListeners();
      return true;
  } catch (error) {
      if (error instanceof WalletError) {
          throw error;
      }
      throw new WalletError(
          'Injected wallet connection failed',
          'INJECTED_CONNECTION_FAILED',
          error
      );
  }
}

/**
* WalletConnect Integration
* Handles WalletConnect connections across all platforms
*/
async connectWalletConnect() {
  try {
      // Clear any existing sessions
      localStorage.clear();
      
      // Ensure RPC connection first
      await this.connectToRPC();

      // Setup RPC mapping for WalletConnect
      const rpcUrlMap = {};
      const chainIds = [parseInt(CONFIG.CHAIN_ID)];
      rpcUrlMap[parseInt(CONFIG.CHAIN_ID)] = chainConfigs[CONFIG.CHAIN_ID].rpcUrls[0];

      // Initialize WalletConnect provider with enhanced mobile support
      this.wcProvider = await EthereumProvider.init({
          projectId: CONFIG.WALLET_CONNECT_PROJECT_ID,
          chains: chainIds,
          optionalChains: chainIds,
          showQrModal: true,
          rpcMap: rpcUrlMap,
          metadata: {
              name: CONFIG.APP_NAME,
              description: 'Web3-enabled ELON PEPE DOGE game',
              url: CONFIG.APP_URL,
              icons: [`${CONFIG.APP_URL}/images/MEMESPIN-H1.png`]
          },
          qrModalOptions: {
              themeMode: "dark",
              themeVariables: {
                  "--w3m-z-index": "999999",
                  "--w3m-accent-color": "#732eff"
              },
              mobileLinks: [
                  "rainbow",
                  "metamask",
                  "trust",
                  "ledger"
              ],
              desktopLinks: [],
              explorerExcludedWalletIds: undefined,
              privacyPolicyUrl: `${CONFIG.APP_URL}/privacy`,
              termsOfServiceUrl: `${CONFIG.APP_URL}/terms`
          },
          // Required for iOS Safari
          disableProviderPing: true
      });

      // Setup event handlers
      this.wcProvider.on("connect", () => {
          console.log("WalletConnect connected");
          this.emit('connected', {
              provider: 'walletconnect',
              address: this.currentWallet
          });
      });

      this.wcProvider.on("disconnect", () => {
          console.log("WalletConnect disconnected");
          this.handleDisconnect();
      });

      this.wcProvider.on("chainChanged", (chainId) => {
          console.log("WalletConnect chain changed:", chainId);
          this.handleChainChange(chainId);
      });

      this.wcProvider.on("accountsChanged", (accounts) => {
          console.log("WalletConnect accounts changed:", accounts);
          this.handleAccountsChange(accounts);
      });

      // Attempt connection
      await this.wcProvider.connect();
      
      // Verify chain
      const chainId = await this.wcProvider.request({ method: 'eth_chainId' });
      const connectedChainId = parseInt(chainId, 16).toString();
      
      if (connectedChainId !== CONFIG.CHAIN_ID) {
          const switched = await this.switchToChain(this.wcProvider, CONFIG.CHAIN_ID);
          if (!switched) {
              throw new WalletError(
                  'Failed to switch to correct chain',
                  'CHAIN_SWITCH_FAILED'
              );
          }
      }

      // Initialize provider and contracts
      this.provider = new ethers.providers.Web3Provider(this.wcProvider);
      const signer = this.provider.getSigner();
      const accounts = await this.provider.listAccounts();
      
      if (!accounts?.length) {
          throw new WalletError(
              'No accounts available',
              'NO_ACCOUNTS'
          );
      }
      
      this.currentWallet = accounts[0];
      this.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
      this.nftContract = new ethers.Contract(CONFIG.NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

      return true;

} catch (error) {
  // Cleanup on failure
  if (this.wcProvider) {
      try {
          await this.wcProvider.disconnect();
      } catch (disconnectError) {
          console.error('Disconnect error:', disconnectError);
      }
  }
  localStorage.clear();
  
  if (error instanceof WalletError) {
      throw error;
  }
  throw new WalletError(
      'WalletConnect connection failed',
      'WALLETCONNECT_FAILURE',
      error
  );
}
}

/**
* Event Listeners Setup
* Handles wallet events for injected providers
*/
setupEventListeners() {
if (!window.ethereum) return;

window.ethereum.on('accountsChanged', this.handleAccountsChange.bind(this));
window.ethereum.on('chainChanged', this.handleChainChange.bind(this));
window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
}

/**
* Event Handlers
*/
handleAccountsChange(accounts) {
if (!accounts[0]) {
  this.handleDisconnect();
  return;
}
this.currentWallet = accounts[0];
this.emit('accountsChanged', { address: accounts[0] });
}

handleChainChange(chainId) {
const newChainId = parseInt(chainId, 16).toString();
if (newChainId !== CONFIG.CHAIN_ID) {
  this.handleDisconnect();
}
}

handleDisconnect() {
this.state = WalletState.DISCONNECTED;
this.currentWallet = null;
this.provider = null;
this.contract = null;
this.nftContract = null;
this.isInitialized = false;
this.cachedRoundHistory = null;
localStorage.clear();
this.emit('disconnected', {});

// Only reload if in browser context
if (typeof window !== 'undefined') {
  window.location.reload();
}
}

/**
* Core Connection Method
* Handles the main connection flow
*/
async connect() {
if (this.isInitialized && this.provider && this.currentWallet) {
  return true;
}

this.state = WalletState.CONNECTING;
this.emit('connecting', {});

try {
  // Try injected wallet first
  if (!this.isMobile || (this.isMobile && window.ethereum)) {
      try {
          const injectedResult = await this.connectWithTimeout(
              this.connectInjected()
          );
          if (injectedResult) {
              this.state = WalletState.CONNECTED;
              this.isInitialized = true;
              this.emit('connected', {
                  provider: 'injected',
                  address: this.currentWallet
              });
              return true;
          }
      } catch (injectedError) {
          console.log('Injected wallet connection failed, trying WalletConnect...');
          this.lastError = injectedError;
      }
  }

  // Try WalletConnect
  const wcResult = await this.connectWithTimeout(
      this.connectWalletConnect()
  );
  if (wcResult) {
      this.state = WalletState.CONNECTED;
      this.isInitialized = true;
      this.emit('connected', {
          provider: 'walletconnect',
          address: this.currentWallet
      });
      return true;
  }

  this.state = WalletState.ERROR;
  return false;
} catch (error) {
  console.error('Connection error:', error);
  this.state = WalletState.ERROR;
  this.lastError = error;
  this.emit('error', error);
  return false;
}
}

/**
* Disconnect Method
* Handles proper cleanup of all connections
*/
async disconnect() {
try {
  if (this.wcProvider) {
      await this.wcProvider.disconnect();
  }
  this.handleDisconnect();
} catch (error) {
  console.error('Error during disconnect:', error);
  // Force disconnect even if error occurs
  this.handleDisconnect();
}
}

/**
* Connection Status Check
* Verifies current connection state
*/
async checkConnection() {
try {
  if (this.provider) {
      const accounts = await this.provider.listAccounts();
      if (accounts?.length) {
          const network = await this.provider.getNetwork();
          const chainId = network.chainId.toString();
          if (chainId === CONFIG.CHAIN_ID) {
              return true;
          }
      }
  }
  return false;
} catch (error) {
  console.error('Connection check failed:', error);
  return false;
}
}

/**
* Utility Methods
*/
getAddress() {
return this.currentWallet;
}

getProvider() {
return this.provider;
}

getContract() {
return this.contract;
}

getNFTContract() {
return this.nftContract;
}

getNativeCurrency(chainId) {
return chainConfigs[chainId]?.nativeCurrency?.symbol || 'ETH';
}

getState() {
return this.state;
}

getLastError() {
return this.lastError;
}
}

// Create singleton instance
const walletConnection = new WalletConnection();

/**
 * Game-specific mappings
 */
const mapChoice = (choiceNumber) => {
    switch (choiceNumber) {
        case 0: return 'ELON';
        case 1: return 'PEPE';
        case 2: return 'DOGE';
        default: return null;
    }
};

const reverseMapChoice = (choiceString) => {
    switch (choiceString) {
        case 'ELON': return 0;
        case 'PEPE': return 1;
        case 'DOGE': return 2;
        default: return null;
    }
};

/**
 * Game Interaction Methods
 */
export const playGame = async (choice, referrer) => {
    const contract = walletConnection.getContract();
    if (!contract) throw new WalletError('Not connected', 'NO_CONTRACT');

    const choiceIndex = reverseMapChoice(choice);
    const playCost = await contract.playCost();
    
    console.log('Playing game with args:', { 
        choice, 
        choiceIndex, 
        referrer, 
        value: ethers.utils.formatEther(playCost),
        timestamp: new Date().toISOString()
    });

    try {
        const tx = await contract.play(choiceIndex, referrer, { value: playCost });
        const receipt = await tx.wait();

        if (walletConnection.getAddress()) {
            await fetchRoundHistory(
                walletConnection.getAddress(),
                await contract.currentRoundId(),
                true
            );
        }

        return receipt;
    } catch (error) {
        throw new WalletError(
            'Failed to play game',
            'PLAY_FAILED',
            error
        );
    }
};

export const fetchRoundHistory = async (address, currentRoundId, forceRefresh = false) => {
    const contract = walletConnection.getContract();
    if (!contract) throw new WalletError('Not connected', 'NO_CONTRACT');

    console.log('Loading round history...');
    
    if (walletConnection.cachedRoundHistory && !forceRefresh) {
        console.log('Using cached history');
        return walletConnection.cachedRoundHistory;
    }

    try {
        let history = [];
        for (let i = Math.max(1, currentRoundId - 20); i < currentRoundId; i++) {
            const playerInfo = await contract.getPlayerInfo(i, address);
            if (playerInfo.hasPlayed) {
                const rewardWithFee = playerInfo.reward;
                const rewardAfterFee = rewardWithFee.mul(8).div(10);
                history.push({
                    id: i,
                    result: ['Pending', 'Win', 'Draw', 'Lose'][playerInfo.result],
                    reward: ethers.utils.formatEther(rewardAfterFee),
                    hasPlayed: playerInfo.hasPlayed,
                    hasClaimed: playerInfo.hasClaimed
                });
            }
        }
        
        walletConnection.cachedRoundHistory = history;
        console.log('Round history loaded:', history);
        return history;
    } catch (error) {
        throw new WalletError(
            'Failed to fetch round history',
            'HISTORY_FETCH_FAILED',
            error
        );
    }
};

export const fetchGameState = async (address = null) => {
    const contract = walletConnection.getContract();
    if (!contract) throw new WalletError('Not connected', 'NO_CONTRACT');

    try {
        const [contractInfo, currentRoundId, currentRoundInfo] = await Promise.all([
            contract.getContractInfo(),
            contract.currentRoundId(),
            contract.getRoundInfo(await contract.currentRoundId())
        ]);
        
        let currentPlayerInfo = null;
        let previousRoundInfo = null;
        let previousPlayerInfo = null;

        if (address) {
            currentPlayerInfo = await contract.getPlayerInfo(currentRoundId, address);

            if (currentRoundId > 1) {
                [previousRoundInfo, previousPlayerInfo] = await Promise.all([
                    contract.getRoundInfo(currentRoundId - 1),
                    contract.getPlayerInfo(currentRoundId - 1, address)
                ]);

                if (previousPlayerInfo && 
                    (previousPlayerInfo.result === 1 || previousPlayerInfo.result === 2)) {
                    console.log('Win/Draw detected in previous round, refreshing history...');
                    await fetchRoundHistory(address, currentRoundId, true);
                }
            }

            if (!walletConnection.cachedRoundHistory) {
                await fetchRoundHistory(address, currentRoundId);
            }
        }

        const gameState = {
            currentRoundId: currentRoundId.toNumber(),
            playersInRound: currentRoundInfo.totalPlayers.toNumber(),
            maxPlayers: contractInfo._maxPlayersPerRound.toNumber(),
            playCost: ethers.utils.formatEther(contractInfo._playCost),
            prizePool: ethers.utils.formatEther(currentRoundInfo.totalPool),
            rockCount: currentRoundInfo.rockCount.toNumber(),
            paperCount: currentRoundInfo.paperCount.toNumber(),
            scissorsCount: currentRoundInfo.scissorsCount.toNumber(),
            winningChoice: mapChoice(currentRoundInfo.officialChoice.toNumber()),
            roundStatus: ['Active', 'PendingRandomness', 'Calculating', 'Finalized'][currentRoundInfo.status],
            playerChoice: currentPlayerInfo ? (currentPlayerInfo.hasPlayed ? mapChoice(currentPlayerInfo.playerChoice) : null) : null,
            playerResult: currentPlayerInfo ? ['Pending', 'Win', 'Draw', 'Lose'][currentPlayerInfo.result] : null,
            playerReward: currentPlayerInfo ? ethers.utils.formatEther(currentPlayerInfo.reward) : '0',
            roundDuration: contractInfo._roundDuration.toNumber(),
            dev1Address: contractInfo._dev1,
            endTime: currentRoundInfo.endTime.toNumber(),
            roundHistory: walletConnection.cachedRoundHistory || [],
            previousRound: previousRoundInfo ? {
                roundId: currentRoundId - 1,
                status: ['Active', 'PendingRandomness', 'Calculating', 'Finalized'][previousRoundInfo.status],
                playerChoice: previousPlayerInfo ? (previousPlayerInfo.hasPlayed ? mapChoice(previousPlayerInfo.playerChoice) : null) : null,
                playerResult: previousPlayerInfo ? ['Pending', 'Win', 'Draw', 'Lose'][previousPlayerInfo.result] : null,
                playerReward: previousPlayerInfo ? ethers.utils.formatEther(previousPlayerInfo.reward) : '0',
            } : null
        };

// Calculate pending rewards from cached history
let pendingRewards = '0';
if (walletConnection.cachedRoundHistory) {
    const totalPending = walletConnection.cachedRoundHistory.reduce((total, round) => {
        if (!round.hasClaimed && round.result !== 'Pending' && round.result !== 'Lose') {
            return total + parseFloat(round.reward);
        }
        return total;
    }, 0);
    pendingRewards = totalPending.toString();
}
gameState.pendingRewards = pendingRewards;

return gameState;
} catch (error) {
if (error.code === 'INVALID_ARGUMENT' || error.code === 'UNSUPPORTED_OPERATION') {
    walletConnection.isInitialized = false;
}
throw new WalletError(
    'Failed to fetch game state',
    'GAME_STATE_FETCH_FAILED',
    error
);
}
};

export const endRound = async () => {
const contract = walletConnection.getContract();
if (!contract) throw new WalletError('Not connected', 'NO_CONTRACT');

try {
const tx = await contract.handleRoundTransition();
const receipt = await tx.wait();
return receipt;
} catch (error) {
throw new WalletError(
    'Failed to end round',
    'END_ROUND_FAILED',
    error
);
}
};

export const claimRewards = async () => {
const contract = walletConnection.getContract();
if (!contract || !walletConnection.cachedRoundHistory) {
throw new WalletError(
    'Not connected or no history available',
    'NO_CONTRACT_OR_HISTORY'
);
}

try {
const claimableRounds = walletConnection.cachedRoundHistory
    .filter(round => !round.hasClaimed && 
            round.result !== 'Pending' && 
            round.result !== 'Lose' && 
            parseFloat(round.reward) > 0)
    .map(round => round.id);

if (!claimableRounds.length) {
    throw new WalletError(
        'No rewards to claim',
        'NO_REWARDS'
    );
}

console.log('Claiming rewards for rounds:', claimableRounds);
const tx = await contract.claim(claimableRounds);
const receipt = await tx.wait();

// Force refresh history after successful claim
const currentRoundId = await contract.currentRoundId();
await fetchRoundHistory(walletConnection.getAddress(), currentRoundId, true);

return receipt;
} catch (error) {
throw new WalletError(
    'Failed to claim rewards',
    'CLAIM_FAILED',
    error
);
}
};

export const checkNFTOwnership = async (address) => {
const nftContract = walletConnection.getNFTContract();
if (!nftContract) throw new WalletError('Not connected', 'NO_CONTRACT');

try {
const balance = await nftContract.balanceOf(address);
return balance.gt(0);
} catch (error) {
throw new WalletError(
    'Failed to check NFT ownership',
    'NFT_CHECK_FAILED',
    error
);
}
};

export const mintNFT = async () => {
const nftContract = walletConnection.getNFTContract();
if (!nftContract) throw new WalletError('Not connected', 'NO_CONTRACT');

try {
const mintCost = await nftContract.mintCost();
const tx = await nftContract.mint({ value: mintCost });
const receipt = await tx.wait();
return receipt;
} catch (error) {
throw new WalletError(
    'Failed to mint NFT',
    'MINT_FAILED',
    error
);
}
};

// Public API Exports
export const initializeProvider = () => walletConnection.connect();
export const disconnectWallet = () => walletConnection.disconnect();
export const getCurrentWalletAddress = () => walletConnection.getAddress();
export const getProvider = () => walletConnection.getProvider();
export const getNativeCurrency = (chainId) => walletConnection.getNativeCurrency(chainId);
export const getWalletState = () => walletConnection.getState();
export const getLastError = () => walletConnection.getLastError();

// Event subscription
export const subscribeToWalletEvents = (listener) => {
walletConnection.addListener(listener);
return () => walletConnection.removeListener(listener);
};

// Default export
export default {
initializeProvider,
disconnectWallet,
getCurrentWalletAddress,
getProvider,
getNativeCurrency,
getWalletState,
getLastError,
subscribeToWalletEvents,
playGame,
endRound,
claimRewards,
checkNFTOwnership,
mintNFT,
fetchGameState,
fetchRoundHistory
};
```

#### feedback.js
```javascript
// utils/feedback.js

// Sound configurations
export const CLICK_VOLUME_1 = 0.1;
export const CLICK_VOLUME_2 = 0.5;
export const HORN_VOLUME = 0.4;
export const MIN_CLICK_INTERVAL = 50;

// Vibration durations (in milliseconds)
export const WHEEL_SNAP_VIBRATION = 6;
export const BUTTON_CLICK_VIBRATION = 12;
export const CONFETTI_VIBRATION = 25;

// Initialize audio
const click1 = new Audio('/sounds/click1.mp3');
const click2 = new Audio('/sounds/click2.mp3');
const horn = new Audio('/sounds/horn1.mp3');

click1.volume = CLICK_VOLUME_1;
click2.volume = CLICK_VOLUME_2;
horn.volume = HORN_VOLUME;

let lastClickTime = 0;

const playVibration = (duration) => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch (error) {
    console.log('Vibration not supported or not allowed');
  }
};

export const playWheelSnap = () => {
  const now = Date.now();
  if (now - lastClickTime >= MIN_CLICK_INTERVAL) {
    try {
      click1.currentTime = 0;
      click1.play().catch(error => console.log('Audio playback prevented:', error));
    } catch (error) {
      console.log('Audio playback error:', error);
    }
    playVibration(WHEEL_SNAP_VIBRATION);
    lastClickTime = now;
  }
};

export const playClick2 = () => {
  const now = Date.now();
  if (now - lastClickTime >= MIN_CLICK_INTERVAL) {
    try {
      click2.currentTime = 0;
      click2.play().catch(error => console.log('Audio playback prevented:', error));
    } catch (error) {
      console.log('Audio playback error:', error);
    }
    // Double vibration with shorter duration
    playVibration([BUTTON_CLICK_VIBRATION, BUTTON_CLICK_VIBRATION]);
    lastClickTime = now;
  }
};

export const playHornSound = () => {
  try {
    horn.currentTime = 0;
    horn.play().catch(error => console.log('Audio playback prevented:', error));
  } catch (error) {
    console.log('Audio playback error:', error);
  }
  playVibration(CONFETTI_VIBRATION);
};
```

### Components

#### App.js
```javascript
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
```

#### App.css
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

:root {
  /* Colors */
  --primary-light: #732eff;
  --primary-dark: #3a1b78;
  --primary-hover: #8571ff;
  --background-color: #080808;
  --text-color-light: #ffffff;
  --text-color-dark: #080808;
  --gray-light: #343843;
  --gray-dark: #2a2e38;
  --overlay-background: #121418;
  --overlay-borders: #2a2e38;
  --dull-purple: #8571ff;
  --normal-gray: #9ba5b4;

  /* Game-specific colors */
  --elon-color-light: #e74eaa;
  --elon-color-dark: #450f2f;
  --pepe-color-light: #45e46d;
  --pepe-color-dark: #0f3118;
  --doge-color-light: #f48229;
  --doge-color-dark: #5b310f;

  /* Button sizes */
  --close-button-size: 32px;
  --utility-button-size: 48px;

  /* Core game dimensions */
  --game-max-size: 1000px;
  --game-min-size: 300px;
  --game-padding: 2vmin;

  /* Responsive scaling */
  --viewport-scale: min(100vh / var(--game-max-size), 100vw / var(--game-max-size));
  --game-current-size: min(var(--game-max-size), 100vh, 100vw);
  --content-scale: min(1, calc(var(--game-current-size) / var(--game-max-size)));

  /* Typography */
  --font-family: 'Nunito', sans-serif;
  --header-font-family: 'Orbitron', sans-serif;
  --font-scale: var(--content-scale);
  --base-font-size: max(14px, calc(16px * var(--font-scale)));
  --large-font-size: max(16px, calc(20px * var(--font-scale)));
  --xlarge-font-size: max(18px, calc(24px * var(--font-scale)));
  --huge-font-size: max(24px, calc(32px * var(--font-scale)));
  --small-font-size: max(12px, calc(14px * var(--font-scale)));

  /* Spacing system */
  --space-unit: calc(8px * var(--content-scale));
  --space-xs: var(--space-unit);
  --space-sm: calc(var(--space-unit) * 2);
  --space-md: calc(var(--space-unit) * 3);
  --space-lg: calc(var(--space-unit) * 4);
  --space-xl: calc(var(--space-unit) * 6);
  --space-xxl: calc(var(--space-unit) * 8);

  /* UI Elements */
  --border-radius: max(8px, calc(12px * var(--content-scale)));
  --button-height: max(40px, calc(45px * var(--content-scale)));
  --button-min-width: max(120px, calc(150px * var(--content-scale)));
  --button-padding: calc(12px * var(--content-scale));

  /* Sections relative sizing */
  --header-height: 25%;
  --content-height: 45%;
  --footer-height: 30%;

  /* Content weights */
  --weight-heavy: 1;
  --weight-medium: 0.6;
  --weight-light: 0.4;

  /* Transitions */
  --transition-speed: 0.3s;

  /* Effects */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3);

  /* Chunky button variables */
  --button-shadow-offset: 8px;
  --button-shadow-offset-hover: 12px;
  --button-shadow-color: rgba(0, 0, 0, 0.3);
  --button-height-chunky: min(45px, 10vh);
  --button-min-width-chunky: min(135px, 35vw);
  --close-button-size: 32px;
  --button-border-radius: 24px;
  --button-spacing: 16px;
  --button-transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base styles */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--background-color);
  color: var(--text-color-light);
  font-family: var(--font-family);
  font-size: var(--base-font-size);
  line-height: 1.5;
}

/* App container */
.App {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Background effects */
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: radial-gradient(circle at center, 
    var(--background-color) 0%, 
    var(--background-color) 25%, 
    #2a0e1e 50%, 
    #113719 75%, 
    #40220a 100%);
  animation: gradientShift 3s infinite linear;
}

@keyframes gradientShift {
  0%, 100% { filter: hue-rotate(0deg); }
  33% { filter: hue-rotate(120deg); }
  66% { filter: hue-rotate(240deg); }
}

/* Game wrapper */
.game-wrapper {
  position: relative;
  z-index: 1;
  width: var(--game-current-size);
  height: var(--game-current-size);
  max-width: var(--game-max-size);
  max-height: var(--game-max-size);
  min-width: var(--game-min-size);
  min-height: var(--game-min-size);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--game-padding);
  box-sizing: border-box;
}

/* Main game container */
.game-content {
  width: 100%;
  height: 100%;
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
}

/* Global chunky button style */
.chunky-button {
  height: var(--button-height-chunky);
  min-width: var(--button-min-width-chunky);
  font-size: var(--xlarge-font-size);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--button-border-radius);
  background-color: var(--primary-light);
  box-shadow: 0 var(--button-shadow-offset) 0 var(--primary-dark);
  transition: var(--button-transition);
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color-light);
  margin: 0 auto;
}

.chunky-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--primary-dark);
}

.chunky-button:active {
  transform: translateY(4px);
  box-shadow: none;
}

.chunky-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 var(--button-shadow-offset) 0 var(--primary-dark);
}

/* Global close button style */
.button-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.close-button:hover,
.circle-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--gray-dark);
}

.close-button:active,
.circle-button:active {
  transform: translateY(4px);
  box-shadow: none;
}

.close-button {
  width: var(--close-button-size);
  height: var(--close-button-size);
  border-radius: 50%;
  background-color: var(--gray-light);
  border: none;
  color: var(--text-color-light);
  font-size: calc(var(--close-button-size) * 0.5);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  /* margin-left: var(--button-spacing); */
  box-shadow: 0 var(--button-shadow-offset) 0 var(--gray-dark);
  transition: var(--button-transition);
}

.close-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--gray-dark);
}

.close-button:active {
  transform: translateY(4px);
  box-shadow: none;
}

.circle-button {
  width: var(--utility-button-size);
  height: var(--utility-button-size);
  border-radius: 50%;
  background-color: var(--gray-light);
  border: none;
  color: var(--text-color-light);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  box-shadow: 0 var(--button-shadow-offset) 0 var(--gray-dark);
  transition: var(--button-transition);
}

/* Button container on WelcomeScreen*/
.connected-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--button-spacing);
}

/* Utility classes */
.noselect {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
  pointer-events: none;
}

.nodrag {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

/* Error boundary */
.error-boundary {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-xl);
  box-sizing: border-box;
  background-color: var(--background-color);
}

.error-boundary h1 {
  color: var(--primary-light);
  font-family: var(--header-font-family);
  font-size: var(--huge-font-size);
  margin-bottom: var(--space-lg);
}

.error-boundary p {
  color: var(--text-color-light);
  font-size: var(--large-font-size);
}

/* Media queries */
@media (max-height: 600px) {
  .game-wrapper {
    padding: var(--space-sm);
  }
}

@media (max-height: 400px) {
  .game-wrapper {
    padding: var(--space-xs);
  }
}
```

#### GameContainer.js
```javascript
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
```

#### GameContainer.css
```css
.scale-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.game-panel {
  position: relative;
}

/* Top Panel Section */
.top-panel {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: var(--space-xl);
  padding: var(--space-xl);
  background: rgba(0, 0, 0, 0.1);
  min-height: 130px;
  align-items: stretch;
}

.info-box {
  padding-left: 7px;
  padding-right: 5px;
  padding-top: 5px;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-md);
}

.progress-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.bar-label {
  font-size: var(--small-font-size);
  color: var(--normal-gray);
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: var(--gray-dark);
  border-radius: calc(var(--border-radius) * 0.75);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease-out;
}

.time-fill, .player-fill  { 
  background-color: var(--primary-light); 
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-color-light);
  font-weight: 600;
  font-size: calc(var(--base-font-size) * 0.65);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

/* Prize Section */

.prize-pool, .rewards-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.prize-label, .info-label {
  font-size: var(--small-font-size);
  color: var(--normal-gray);
  margin-bottom: 2px;
}

.prize-amount, .info-value {
  font-size: var(--large-font-size);
  font-weight: bold;
  color: var(--primary-light);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

/* Play Button */
.play-button {
  width: 90%;
  height: min(45px, 8vh);
  font-size: calc(var(--large-font-size) * 1.1);
  padding: 0 var(--space-xl);
  border-radius: calc(var(--border-radius) * 2);
  margin-top: auto;
}

.play-button.elon {
  background-color: var(--elon-color-light);
  box-shadow: 0 var(--button-shadow-offset) 0 var(--elon-color-dark);
}

.play-button.elon:hover {
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--elon-color-dark);
}

.play-button.pepe {
  background-color: var(--pepe-color-light);
  box-shadow: 0 var(--button-shadow-offset) 0 var(--pepe-color-dark);
}

.play-button.pepe:hover {
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--pepe-color-dark);
}

.play-button.doge {
  background-color: var(--doge-color-light);
  box-shadow: 0 var(--button-shadow-offset) 0 var(--doge-color-dark);
}

.play-button.doge:hover {
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--doge-color-dark);
}

/* Claim Button */
.claim-button {
  width: 90%;
  height: min(45px, 8vh);
  font-size: var(--large-font-size);
  margin-top: auto;
}

/* Main Game Panel */
.main-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
  padding: var(--space-xl);
  margin-top: var(--space-xl);
}

/* Utility Buttons */
.utility-buttons {
  position: absolute;
  top: 20px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-xl);
  transform: translateY(var(--space-sm));
  z-index: 2;
}

.button-icon {
  max-width: 50%;
  max-height: 50%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Loading Screen */
.loading-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--background-color);
}

.loading-icon-container {
  width: min(150px, 30vh);
  height: min(150px, 30vh);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.25s ease-in-out;
}

/* Spin Wheel */
.spin-wheel-wrapper {
  width: 95%;
  height: 95%;
  max-width: min(1000px, 95vh);
  max-height: min(1000px, 95vh);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  margin: auto;
}

/* Status Info */
.status-info {
  position: absolute;
  top: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  z-index: 2;
  border: 1px solid var(--overlay-borders);
}

/* Overlay Container */
.overlay-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}

.overlay-container > * {
  pointer-events: auto;
}

/* Popups and Overlays */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
}

.popup {
  position: relative;
  width: min(90%, 500px);
  background-color: var(--overlay-background);
  border: 1px solid var(--overlay-borders);
  border-radius: calc(var(--border-radius) * 2);
  padding-bottom: 15px;
}

.popup-content {
  /* padding: var(--space-xl); */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* gap: var(--space-lg); */
}

.popup-close-button {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: min(40px, 6vh);
  height: min(40px, 6vh);
  padding: calc(var(--space-unit) * 1.5);
  border-radius: 50%;
  margin: 0;
  background-color: var(--gray-light);
  box-shadow: 0 4px 0 var(--gray-dark);
  z-index: 2;
}

.popup-close-button .button-icon {
  max-width: 40%;
  max-height: 40%;
}

/* Media Queries */
@media (max-width: 480px) {
  .top-panel {
    min-height: 110px;
    gap: var(--space-sm);
    padding: var(--space-md);
  }

  /* .info-box {
    padding-left: 7px;
    padding-right: 5px;
    padding-top: 5px;
  } */

  .progress-bar {
    height: 16px;
  }
  .progress-text{
    font-size: 10px;
  }

  .bar-label,
  .prize-label,
  .info-label {
    font-size: calc(var(--base-font-size));
  }

  .prize-amount,
  .info-value {
    font-size: 12px;
  }

  .play-button,
  .claim-button {
    height: min(32px, 6vh);
    font-size: calc(var(--base-font-size) * 0.85);
    padding: 0 var(--space-md);
    
    width: 85%;
  }

  .circle-button {
    width: min(35px, 6vh);
    height: min(35px, 6vh);
    padding: 6px;
  }

  .utility-buttons {
    padding: 0 var(--space-md);
  }
}

@media (max-width: 360px) {
  .top-panel {
    min-height: 100px;
    gap: var(--space-xs);
    padding: var(--space-sm);
  }

  .progress-bar {
    height: 14px;
  }

  .prize-amount,
  .info-value {
    font-size: var(--base-font-size);
  }

  .play-button,
  .claim-button {
    height: min(28px, 5vh);
    font-size: calc(var(--base-font-size) * 0.8);
    width: 80%;
  }

  .circle-button {
    width: min(32px, 5vh);
    height: min(32px, 5vh);
    padding: 5px;
  }
}
```

#### SpinWheel.js
```javascript
// SpinWheel.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { playWheelSnap } from '../utils/feedback';
import './SpinWheel.css';

const STATES = ['DOGE', 'ELON', 'PEPE'];
const SNAP_POINTS = 36;
const SPIN_DURATION_MIN = 2000;
const SPIN_DURATION_MAX = 3000;

const SpinWheel = ({ 
  onChoiceSelect, 
  currentRoundStatus, 
  playerChoice, 
  canInitiateSpin = true 
}) => {
  const [displayRotation, setDisplayRotation] = useState(0);
  const [currentState, setCurrentState] = useState('ELON');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const wheelRef = useRef(null);
  const dragZoneRef = useRef(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const totalRotation = useRef(0);
  const initialSpinCompleted = useRef(false);
  const lastSnappedRotation = useRef(0);

  const isWheelDisabled = currentRoundStatus === 'Active' && playerChoice !== null;

  const getAngle = useCallback((clientX, clientY) => {
    const rect = dragZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  useEffect(() => {
    const imagesToLoad = [
      ...STATES.map(state => `/images/${state.toLowerCase()}-base.png`),
      ...STATES.map(state => `/images/${state.toLowerCase()}-static.png`),
      '/images/wheel.png'
    ];

    let loadedCount = 0;
    imagesToLoad.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (imagesLoaded && !initialSpinCompleted.current && canInitiateSpin) {
      setTimeout(() => {
        if (playerChoice) {
          const rotation = getRotationForChoice(playerChoice);
          setDisplayRotation(rotation);
          totalRotation.current = rotation;
          updateCurrentState(rotation);
        } else {
          startRandomSpin();
        }
        initialSpinCompleted.current = true;
      }, 100);
    }
  }, [imagesLoaded, playerChoice, canInitiateSpin]);

  const updateCurrentState = useCallback((rotation) => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    let newState;
    if (normalizedRotation >= 240 && normalizedRotation < 360) {
      newState = 'ELON';
    } else if (normalizedRotation >= 120 && normalizedRotation < 240) {
      newState = 'PEPE';
    } else {
      newState = 'DOGE';
    }
    setCurrentState(newState);
    onChoiceSelect(newState);
  }, [onChoiceSelect]);

  const snapRotation = useCallback((rotation) => {
    const snapAngle = 360 / SNAP_POINTS;
    const snappedRotation = Math.round(rotation / snapAngle) * snapAngle;
    if (snappedRotation !== lastSnappedRotation.current) {
      playWheelSnap();
      lastSnappedRotation.current = snappedRotation;
    }
    return snappedRotation;
  }, []);

  const handleDragStart = useCallback((clientX, clientY) => {
    if (isSpinning || isWheelDisabled) return;
    
    const rect = dragZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
    
    if (distance < rect.width * 0.1) {
      startRandomSpin();
    } else {
      isDragging.current = true;
      startAngle.current = getAngle(clientX, clientY);
    }
  }, [getAngle, isSpinning, isWheelDisabled]);

  const startRandomSpin = () => {
    if (isSpinning || isWheelDisabled) return;
    setIsSpinning(true);
    const targetRotation = totalRotation.current + 1080 + Math.random() * 720;
    const spinDuration = SPIN_DURATION_MIN + Math.random() * (SPIN_DURATION_MAX - SPIN_DURATION_MIN);
    const startTime = Date.now();

    const animateSpin = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < spinDuration) {
        const progress = elapsedTime / spinDuration;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentRotation = totalRotation.current + (targetRotation - totalRotation.current) * easedProgress;
        
        const snappedRotation = snapRotation(currentRotation);
        setDisplayRotation(currentRotation);
        updateCurrentState(currentRotation);
        requestAnimationFrame(animateSpin);
      } else {
        totalRotation.current = targetRotation;
        setDisplayRotation(targetRotation);
        updateCurrentState(targetRotation);
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleDrag = useCallback((clientX, clientY) => {
    if (!isDragging.current || isSpinning || isWheelDisabled) return;
    
    const currentAngle = getAngle(clientX, clientY);
    let deltaAngle = currentAngle - startAngle.current;
    
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    totalRotation.current += deltaAngle;
    const snappedRotation = snapRotation(totalRotation.current);
    
    setDisplayRotation(snappedRotation);
    updateCurrentState(snappedRotation);
    
    startAngle.current = currentAngle;
  }, [getAngle, isSpinning, snapRotation, updateCurrentState, isWheelDisabled]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((clientX, clientY) => {
    const rect = dragZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
    
    setIsHovering(distance < rect.width * 0.1);

    if (isDragging.current && !isSpinning && !isWheelDisabled) {
      handleDrag(clientX, clientY);
    }
  }, [handleDrag, isSpinning, isWheelDisabled]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsTouching(true);
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    handleDragEnd();
  }, [handleDragEnd]);

  useEffect(() => {
    const handleMouseMoveEvent = (e) => handleMouseMove(e.clientX, e.clientY);
    const handleTouchMoveEvent = (e) => {
      e.preventDefault();
      handleMouseMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    document.addEventListener('mousemove', handleMouseMoveEvent);
    document.addEventListener('touchmove', handleTouchMoveEvent, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveEvent);
      document.removeEventListener('touchmove', handleTouchMoveEvent);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleMouseMove, handleDragEnd]);

  const getRotationForChoice = (choice) => {
    switch (choice) {
      case 'ELON':
        return 300; // Middle of ELON range (240-360)
      case 'PEPE':
        return 180; // Middle of PEPE range (120-240)
      case 'DOGE':
        return 60;  // Middle of DOGE range (0-120)
      default:
        return 0;
    }
  };

  return (
    <div 
      className={`spin-wheel-container ${isSpinning ? 'spinning' : ''} ${isHovering ? 'hovering' : ''} ${isTouching ? 'touching' : ''} ${isWheelDisabled ? 'disabled' : ''}`}
      style={{ opacity: imagesLoaded ? 1 : 0 }}
      ref={wheelRef}
    >
      {STATES.map((state) => (
        <img 
          key={`${state}-base`}
          src={`/images/${state.toLowerCase()}-base.png`}
          alt={`${state} base`}
          className={`base-image noselect ${currentState === state ? 'active' : ''}`}
          draggable="false"
        />
      ))}
      {STATES.map((state) => (
        <img 
          key={`${state}-static`}
          src={`/images/${state.toLowerCase()}-static.png`}
          alt={state}
          className={`static-image noselect ${currentState === state ? 'active' : ''}`}
          draggable="false"
        />
      ))}
      <img 
        src="/images/wheel.png"
        alt="Wheel"
        className="wheel-image noselect"
        draggable="false"
        style={{ transform: `rotate(${displayRotation}deg)` }}
      />
      <div 
        className="drag-zone nodrag"
        ref={dragZoneRef}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      ></div>
    </div>
  );
};

export default SpinWheel;
```

#### SpinWheel.css
```css
:root {
  --static-image-scale: 0.3;
  --static-image-hover-scale: 0.35;
  --static-image-touch-scale: 0.33;
}

.spin-wheel-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.base-image, .static-image, .wheel-image, .drag-zone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.base-image, .static-image {
  opacity: 0;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.base-image.active, .static-image.active {
  opacity: 1;
}

.static-image {
  transform: scale(var(--static-image-scale));
}

.spin-wheel-container.hovering .static-image.active,
.spin-wheel-container.touching .static-image.active {
  transform: scale(var(--static-image-hover-scale));
}

.spin-wheel-container.touching .static-image.active {
  transition: transform 0.1s ease;
}

.wheel-image {
  z-index: 3;
  transition: transform 0.1s ease-out;
  pointer-events: none;
}

.drag-zone {
  z-index: 4;
  cursor: grab;
}

.drag-zone:active {
  cursor: grabbing;
}

.base-image { z-index: 1; }
.static-image { z-index: 2; }

.spin-wheel-container.spinning .base-image,
.spin-wheel-container.spinning .static-image,
.spin-wheel-container.spinning .wheel-image {
  transition: none;
}

.spin-wheel-container.spinning .drag-zone {
  cursor: not-allowed;
}

.spin-wheel-container.disabled .drag-zone {
  cursor: not-allowed;
}

.spin-wheel-container.disabled {
  opacity: 0.7;
}
```

#### DistributionOverlay.js
```javascript
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
```

#### DistributionOverlay.css
```css
.distribution-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxl);
  padding: var(--space-xl);
  margin-left: 15px;
  margin-right: 15px;
  margin-top: 5px;
  margin-bottom: 10px;
 }
 
 .distribution-title {
  font-family: var(--header-font-family);
  font-size: var(--huge-font-size);
  color: var(--primary-light);
  text-align: center;
  text-shadow: 0 0 10px rgba(115, 46, 255, 0.5);
 }
 
 .section-title {
  font-family: var(--header-font-family);
  font-size: var(--xlarge-font-size);
  color: var(--primary-light);
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(115, 46, 255, 0.5);
 }
 
 /* Distribution Bar */
 .distribution-bar {
  height: min(40px, 6vh);
  display: flex;
  border-radius: calc(var(--border-radius) * 0.75);
  overflow: hidden;
  margin-bottom: var(--space-md);
 }
 
 .distribution-bar > div {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: width var(--transition-speed) ease;
 }
 
 .distribution-bar .elon { background-color: var(--elon-color-light); }
 .distribution-bar .pepe { background-color: var(--pepe-color-light); }
 .distribution-bar .doge { background-color: var(--doge-color-light); }
 
 .percentage {
  color: var(--text-color-light);
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
 }
 
 .distribution-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--large-font-size);
  font-weight: 600;
  margin-bottom: var(--space-lg);
 }
 
 .elon-label { color: var(--elon-color-light); }
 .pepe-label { color: var(--pepe-color-light); }
 .doge-label { color: var(--doge-color-light); }
 
 .total-players {
  text-align: center;
  font-size: var(--large-font-size);
  color: var(--normal-gray);
 }
 
 /* Predicted Winnings */
 .predicted-winnings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  margin: 0 auto;
  max-width: min(800px, 90%);
 }
 
 .prediction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--border-radius);
 }
 
 .prediction .label {
  font-size: var(--large-font-size);
  font-weight: 600;
 }
 
 .prediction .value {
  font-size: var(--xlarge-font-size);
  font-weight: bold;
 }
 
 .prediction.elon .label,
 .prediction.elon .value { color: var(--elon-color-light); }
 .prediction.pepe .label,
 .prediction.pepe .value { color: var(--pepe-color-light); }
 .prediction.doge .label,
 .prediction.doge .value { color: var(--doge-color-light); }
 
 /* Join Content */
 .join-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxl);
  padding: 0 var(--space-xl);
 }
 
 .benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  text-align: center;
  font-size: var(--large-font-size);
  margin-bottom: 20px;
  line-height: 160%;
 }
 
 .benefits-list li {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
 }
 
 /* Bold purple checkmarks */
 .checkmark {
  color: var(--primary-light);
  font-weight: bold;
  font-size: calc(var(--large-font-size) * 1.2);
  text-shadow: 0 0 8px rgba(115, 46, 255, 0.5);
 }
 
 .mint-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
 }
 
 .mint-section p {
  font-size: var(--large-font-size);
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 10px;
 }
 
 .mint-cost {
  color: var(--primary-light);
  font-weight: bold;
 }
 
 /* Chunky mint button style */
 .mint-button {
  height: min(60px, 10vh);
  font-size: var(--xlarge-font-size);
  padding: 0 var(--space-xl);
  margin-top: var(--space-lg);
  width: min(100%, 300px);
  background-color: var(--primary-light);
  border-radius: calc(var(--border-radius) * 2);
  box-shadow: 0 var(--button-shadow-offset) 0 var(--button-shadow-color);
  transition: all var(--transition-speed) ease;
 }
 
 .mint-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 var(--button-shadow-offset-hover) 0 var(--button-shadow-color);
 }
 
 .mint-button:active {
  transform: translateY(4px);
  box-shadow: none;
 }
 
 .mint-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 var(--button-shadow-offset) 0 var(--button-shadow-color);
 }
 
 @media (max-width: 480px) {
  .distribution-content {
    gap: var(--space-xl);
    padding: var(--space-lg);
  }
 
  .join-content {
    padding: 0;
  }
 
  /* .predicted-winnings {
    grid-template-columns: 1fr;
  } */
 
  .benefits-list {
    font-size: var(--base-font-size);
  }
 }

 .overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
}

.overlay-content {
  position: relative;
  width: min(90%, 500px);
  max-height: 85vh;
  background-color: var(--overlay-background);
  border: 1px solid var(--overlay-borders);
  border-radius: calc(var(--border-radius) * 2);
  overflow: hidden;
}
```

#### SettingsOverlay.js
```javascript
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
```

#### SettingsOverlay.css
```css
.settings-content {
  display: flex;
  flex-direction: column;
  max-height: min(800px, calc(var(--game-current-size) * 0.8));
  overflow-y: auto;
}

.settings-title {
  font-family: var(--header-font-family);
  font-size: var(--huge-font-size);
  color: var(--primary-light);
  text-align: center;
  margin-bottom: var(--space-xxl);
  text-shadow: 0 0 10px rgba(115, 46, 255, 0.5);
}

.settings-section {
  margin-bottom: 15px;
  margin-left: 5px;
  margin-right: 5px;
}

.settings-section-title {
  font-family: var(--header-font-family);
  font-size: var(--xlarge-font-size);
  color: var(--primary-light);
  text-align: center;
  text-shadow: 0 0 10px rgba(115, 46, 255, 0.5);
  margin: 10px;
}

/* Support Buttons */
.support-buttons {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  align-items: center;
}

.support-buttons .chunky-button {
  max-width: min(400px, 80%);
  font-size: var(--xlarge-font-size);
  background-color: var(--primary-light);
  margin: 10px;
}

/* History Section */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0;
  list-style: none;
  margin-top: 20px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius);
  font-size: var(--base-font-size);
  margin: 5px;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.history-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.round-number {
  color: var(--normal-gray);
}

.result {
  font-weight: bold;
}

.result.win { color: var(--pepe-color-light); }
.result.draw { color: var(--primary-light); }
.result.lose { color: var(--elon-color-light); }

.reward-amount {
  color: var(--primary-light);
  font-weight: bold;
}

.unclaimed {
  color: var(--doge-color-light);
  font-style: italic;
}

.no-history {
  text-align: center;
  color: var(--normal-gray);
  margin: var(--space-lg) 0;
  margin-top: 15px;
}

/* Footer */
.settings-footer {
  text-align: center;
  color: var(--normal-gray);
  margin-top: var(--space-xxl);
}

.attribution {
  font-size: var(--small-font-size);
  margin-bottom: var(--space-sm);
}

.winks-link {
  color: var(--primary-light);
  text-decoration: none;
  font-weight: bold;
}

.copyright {
  font-size: calc(var(--small-font-size) * 0.9);
  line-height: 1.4;
  opacity: 0.7;
}

/* Media Queries */
@media (max-width: 480px) {
  .settings-content {
    padding: var(--space-lg);
  }

  .history-item {
    font-size: calc(var(--small-font-size) * 1.1);
    padding: var(--space-sm);
  }

  .support-buttons {
    width: min(50px, 8vh);
    font-size: var(--large-font-size);
  }

  .chunky-button {
    font-size: var(--large-font-size);
  }

  .copyright {
    font-size: calc(var(--small-font-size) * 0.7);
    opacity: 0.5;
  }
}

@media (max-height: 600px) {
  .settings-content {
    padding: var(--space-md);
  }

  .settings-section {
    margin-bottom: var(--space-xl);
  }

  .support-buttons .chunky-button {
    font-size: calc(var(--large-font-size) * 0.9);
  }

  .copyright {
    font-size: calc(var(--small-font-size) * 0.6);
    opacity: 0.5;
  }
}

/* Loading State */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
}

.overlay-content {
  position: relative;
  width: min(90%, 500px);
  max-height: 85vh;
  background-color: var(--overlay-background);
  border: 1px solid var(--overlay-borders);
  border-radius: calc(var(--border-radius) * 2);
  overflow: hidden;
}

/* Scrollbar styling */
.settings-content::-webkit-scrollbar {
  width: 16px; 
  display: block;
}

.settings-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin: 4px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: var(--primary-light);  /* Purple by default now */
  border-radius: 8px;                /* Increased to match wider scrollbar */
  border: 3px solid transparent;     /* Creates padding effect around thumb */
  background-clip: padding-box;      /* Ensures border is transparent */
  min-height: 40px;                 /* Minimum thumb size */
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);  /* Lighter purple on hover */
  border: 2px solid transparent;     /* Slightly thinner border on hover */
}

/* Firefox scrollbar styling */
.settings-content {
  scrollbar-width: thick;          /* Use thick scrollbar in Firefox */
  scrollbar-color: var(--primary-light) rgba(0, 0, 0, 0.3); /* thumb track */
}

/* For Edge support */
.settings-content {
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

/* Ensure the content itself has proper padding */
.settings-content {
  padding-right: 4px;  /* Prevent content from touching scrollbar */
  margin-right: 4px;   /* Add some space for the scrollbar */
}

/* Ensure smooth scrolling */
.settings-content {
  scroll-behavior: smooth;
  overflow-y: scroll;  /* Always show scrollbar */
}

/* Media query adjustments for smaller screens */
@media (max-width: 480px) {
  .settings-content::-webkit-scrollbar {
    width: 20px;  /* Even wider on mobile for easier touch */
  }
  
  .settings-content::-webkit-scrollbar-thumb {
    min-height: 60px;  /* Larger minimum thumb size on mobile */
    border: 4px solid transparent;  /* Larger padding for touch */
  }
}
```

#### WelcomeScreen.js
```javascript
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
```

#### WelcomeScreen.css
```css
.welcome-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 5% 5%;
  box-sizing: border-box;
}

.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
  position: relative;
}

/* Logo section */
.logo-section {
  height: 30%;
  padding: 2% 0;
}

.logo-image {
  width: auto;
  height: 100%;
  max-width: 90%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

/* Character section */
.character-section {
  height: 40%;
  padding: 2% 0;
}

.character-image {
  width: auto;
  height: 100%;
  max-width: 60%;
  object-fit: contain;
  transition: transform 0.25s ease-in-out;
}

/* Button section */
.button-section {
  padding: 2% 0;
}

/* Loading text */
.loading-text {
  color: var(--text-color-light);
  text-align: center;
  font-family: var(--header-font-family);
}

.loading-text.pulsing {
  animation: pulse 1.5s infinite;
}

/* Media Queries */
@media (max-height: 700px) {
  .character-image {
    max-width: 50%;
  }
  
  .logo-image {
    height: 80%;
  }
}

@media (max-height: 600px) {
  .character-image {
    max-width: 45%;
  }
  
  .logo-image {
    height: 75%;
  }

  .connected-buttons {
    gap: var(--space-sm);
  }
}

@media (max-height: 500px) {
  .welcome-container {
    padding: 3% 3%;
  }

  .character-image {
    max-width: 40%;
  }
  
  .logo-image {
    height: 70%;
  }
}

@media (max-height: 400px) {
  .welcome-container {
    padding: 2% 2%;
  }

  .character-section {
    height: 30%;
  }

  .character-image {
    max-width: 35%;
  }
  
  .logo-image {
    height: 60%;
  }
}

@media (max-width: 500px) {
  .character-image {
    max-width: 70%;
  }

  .connected-buttons {
    gap: var(--space-sm);
  }
}

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
```

## Testing

To test the frontend:

1. Ensure all dependencies are installed.
2. Place all required images in the `/public/images/` directory.
3. Run `npm start` and check browser console for errors.
4. Connect wallet and test all game functionalities.
5. Test responsiveness on different screen sizes.
6. Verify all sounds and vibrations work correctly.

For smart contract testing, use Hardhat or Truffle for unit tests.

## Deployment

To deploy the frontend:

1. Build the production version:
   ```
   npm run build
   ```

2. Deploy to your preferred hosting service.

For smart contract deployment:

1. Use Remix, Truffle, or Hardhat.
2. Compile with Solidity v0.8.19 or later.
3. Deploy to desired network.
4. Fund contract with LINK for Chainlink VRF.

## Usage

1. Connect Web3 wallet to appropriate network.
2. Visit the deployed website.
3. Connect wallet to play.
4. Use spin wheel to choose ELON, PEPE, or DOGE.
5. Pay required fee to participate.
6. Share on Twitter for referral rewards.
7. Wait for round results.
8. Claim rewards when available.

## Troubleshooting

Common issues and solutions:
- Ensure correct network is selected in wallet
- Check wallet has sufficient funds
- Verify contract addresses in config
- Clear browser cache if UI issues occur
- Check console for error messages
