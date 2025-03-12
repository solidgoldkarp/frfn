// Simple Bookie Market Contract Addresses
import marketAbi from './marketAbi.json';
import factoryAbi from './factoryAbi.json';

export const simpleBookie = {
  monadTestnet: {
    // Current deployment using the official Monad testnet USDC
    factory: '0x16b35DECec3B0b6461917deE20039487618423C8',
    usdc: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea', // Official Monad testnet USDC
    markets: {
      btcPrice: '0xB5599ac305D498Fc4a69b8606D0f15d573510ce6',
      aiModel: '0xc281Ec0dba64aa2332D94D3E968b46752D2EEa95',
      geopolitical: '0x4FAe92879Ed18fd4E0a935c38f597229df66C873',
      sports: '0x3FdC864abed386f0f9Ee0dA49B5f98FaBE4aAFD9',
      solanaAth: '0x7D9D07D3a2d7a4E15D3A8bfB301bB25c5908eAaF'
    },
    // Keep this for backward compatibility
    testMarket: '0xB5599ac305D498Fc4a69b8606D0f15d573510ce6' // BTC price market
  }
};

// Simple Bookie Market ABI
export const simpleBookieMarketAbi = marketAbi;

// Simple Bookie Factory ABI
export const simpleBookieFactoryAbi = factoryAbi;

// ERC20 ABI (for USDC)
export const erc20Abi = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];