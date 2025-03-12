export const predictionMarketAbi = [
  {
    "inputs": [],
    "name": "isFinalized",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dynamicMarket",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "TokenMinter", "name": "_tokenMinter", "type": "address" },
      { "internalType": "IERC20", "name": "_collateralToken", "type": "address" },
      { "internalType": "IERC20", "name": "_yesToken", "type": "address" },
      { "internalType": "IERC20", "name": "_noToken", "type": "address" },
      { "internalType": "uint256", "name": "_marketResolutionTime", "type": "uint256" },
      { "internalType": "uint256", "name": "_initialProbability", "type": "uint256" },
      { "internalType": "address", "name": "_creator", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "provider", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "yesAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "noAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256" }
    ],
    "name": "LiquidityAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "provider", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "yesAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "noAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256" }
    ],
    "name": "LiquidityRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "bool", "name": "outcome", "type": "bool" }
    ],
    "name": "MarketResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "yesToNo", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amountOut", "type": "uint256" }
    ],
    "name": "Swap",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "TokensMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "isYes", "type": "bool" }
    ],
    "name": "TokensRedeemed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MIN_LIQUIDITY",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PRECISION",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "yesAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "noAmount", "type": "uint256" }
    ],
    "name": "addLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "burnTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentProbability",
    "outputs": [{ "internalType": "uint256", "name": "probability", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMarketInfo",
    "outputs": [
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "uint256", "name": "creationTime", "type": "uint256" },
      { "internalType": "uint256", "name": "resolutionTime", "type": "uint256" },
      { "internalType": "bool", "name": "resolved", "type": "bool" },
      { "internalType": "bool", "name": "outcome", "type": "bool" },
      { "internalType": "uint256", "name": "currentProbability", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "liquidityPositions",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketParams",
    "outputs": [
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "IERC20", "name": "collateralToken", "type": "address" },
      { "internalType": "IERC20", "name": "yesToken", "type": "address" },
      { "internalType": "IERC20", "name": "noToken", "type": "address" },
      { "internalType": "uint256", "name": "marketCreationTime", "type": "uint256" },
      { "internalType": "uint256", "name": "marketResolutionTime", "type": "uint256" },
      { "internalType": "uint256", "name": "initialProbability", "type": "uint256" },
      { "internalType": "bool", "name": "isResolved", "type": "bool" },
      { "internalType": "bool", "name": "outcome", "type": "bool" },
      { "internalType": "address", "name": "creator", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "mintTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolState",
    "outputs": [
      { "internalType": "uint256", "name": "x", "type": "uint256" },
      { "internalType": "uint256", "name": "y", "type": "uint256" },
      { "internalType": "uint256", "name": "l", "type": "uint256" },
      {
        "components": [
          { "internalType": "uint256", "name": "xVirtual", "type": "uint256" },
          { "internalType": "uint256", "name": "yVirtual", "type": "uint256" }
        ],
        "internalType": "struct VirtualReservesLib.VirtualReserves",
        "name": "virtualReserves",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "redeemTokens",
    "outputs": [{ "internalType": "uint256", "name": "collateralAmount", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "name": "removeLiquidity",
    "outputs": [
      { "internalType": "uint256", "name": "yesAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "noAmount", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "_outcome", "type": "bool" }],
    "name": "resolveMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bool", "name": "yesToNo", "type": "bool" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
    ],
    "name": "swap",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenMinter",
    "outputs": [{ "internalType": "TokenMinter", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLiquidityShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
