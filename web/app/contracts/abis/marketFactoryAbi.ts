export const marketFactoryAbi = [
  {
    inputs: [
      {
        internalType: "contract TokenMinter",
        name: "_tokenMinter",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
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
        internalType: "string",
        name: "question",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "resolutionTime",
        type: "uint256",
      },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "question", type: "string" },
      { internalType: "uint256", name: "resolutionTime", type: "uint256" },
      { internalType: "uint256", name: "initialProbability", type: "uint256" },
      { internalType: "contract IERC20", name: "collateralToken", type: "address" },
    ],
    name: "createMarket",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getMarket",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMarketCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "markets",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "tokenMinter",
    outputs: [{ internalType: "contract TokenMinter", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;