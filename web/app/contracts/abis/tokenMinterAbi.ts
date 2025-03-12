export const tokenMinterAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "market",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensBurned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "market",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "market",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "yesToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "noToken",
        type: "address",
      },
    ],
    name: "TokenPairCreated",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "market", type: "address" }],
    name: "authorizeMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "burnTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "market", type: "address" },
      { internalType: "contract IERC20", name: "collateralToken", type: "address" },
      { internalType: "string", name: "question", type: "string" },
      { internalType: "uint256", name: "marketIndex", type: "uint256" },
    ],
    name: "createTokenPair",
    outputs: [
      { internalType: "contract MockERC20", name: "yesToken", type: "address" },
      { internalType: "contract MockERC20", name: "noToken", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "market", type: "address" }],
    name: "deauthorizeMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "market", type: "address" }],
    name: "getTokenPair",
    outputs: [
      { internalType: "address", name: "collateralToken", type: "address" },
      { internalType: "address", name: "yesToken", type: "address" },
      { internalType: "address", name: "noToken", type: "address" },
      { internalType: "uint256", name: "totalSupply", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mintTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bool", name: "isYesOutcome", type: "bool" },
    ],
    name: "redeemWinningTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenPairs",
    outputs: [
      { internalType: "contract IERC20", name: "collateralToken", type: "address" },
      { internalType: "contract MockERC20", name: "yesToken", type: "address" },
      { internalType: "contract MockERC20", name: "noToken", type: "address" },
      { internalType: "uint256", name: "totalSupply", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;