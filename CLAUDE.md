# Project Information for Claude

## Useful Commands

### Build contracts
```bash
forge build
```

### Run tests
```bash
# Run all tests
forge test

# Run specific test file with verbose output
forge test --match-path test/SimpleBookieMarket.buying.t.sol -vvv
```

### Deploy contracts
```bash
# Deploy SimpleBookieMarket to Monad testnet
forge script script/DeploySimpleBookieMarket.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast -vvv --private-key $PRIVATE_KEY
```

### Start frontend
```bash
cd web
yarn dev
```

## Project Structure

This project contains two prediction market implementations:

1. **SimpleBookieMarket** - A minimal bookie-style prediction market
2. **PredictionMarket** - A complex AMM-based market using Black-Scholes math

The SimpleBookieMarket is the primary focus, with the PredictionMarket components kept for comparison.

## SimpleBookieMarket Overview

The SimpleBookieMarket is a straightforward prediction market that:
- Uses a simple bookie-style approach rather than complex AMM math
- Lets users bet YES or NO on binary outcomes
- Calculates probability as the ratio of YES bets to total bets
- Distributes winnings proportionally to all winners

### Key Functions:
- `bet(bool outcome, uint256 amount)`: Place a bet on YES/NO
- `resolve(bool outcome)`: Admin resolves the market
- `redeem()`: Claim winnings after market resolution
- `currentProbability()`: Get current probability based on bet ratio

## Code Style Preferences

- Solidity contracts follow the standard Solidity style guide
- Frontend uses functional React components with hooks
- TypeScript is used for type safety

## Deployed Contracts (Monad Testnet)

### Previous Deployment (Using Mock USDC)
- MockUSDC: `0x134A60Da9637bDe6c7b58e91c9D598aDEc438d11`
- SimpleBookieFactory: `0xC97C1b177CB9B46384bcB1990FD9224FF822Ac99`
- Test Market: `0x1EA7c3396F48A7aCee1a9d1B4eE5C86B8bFF0D7e`

### Current Deployment (Using Official Monad Testnet USDC)
- USDC: `0xf817257fed379853cDe0fa4F97AB987181B1E5Ea` (Official Monad testnet USDC)
- SimpleBookieFactory: `0x16b35DECec3B0b6461917deE20039487618423C8`
- Markets:
  - BTC Price: `0xB5599ac305D498Fc4a69b8606D0f15d573510ce6`
  - AI Model: `0xc281Ec0dba64aa2332D94D3E968b46752D2EEa95`
  - Geopolitical: `0x4FAe92879Ed18fd4E0a935c38f597229df66C873`
  - Sports: `0x3FdC864abed386f0f9Ee0dA49B5f98FaBE4aAFD9`
  - Solana ATH: `0x7D9D07D3a2d7a4E15D3A8bfB301bB25c5908eAaF`

These contracts are configured in the frontend at `web/app/contracts/simpleBookie.ts`.

## Frontend Integration Notes

When using the dApp:
1. Connect wallet first
2. Approve USDC tokens for the market contract (one-time operation)
3. Place bets on YES or NO outcomes
4. After resolution, winning bettors can redeem their winnings