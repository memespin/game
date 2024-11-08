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