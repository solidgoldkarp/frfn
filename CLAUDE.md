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
cd frontend/frontend
npm run dev
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
- SimpleBookieFactory: `0xdB146BE10C84EE31b6B7eB5dF91018158CC24612`
- Test Market: `0x27497b50aF8f400f8457243FD2775fE71eec5825`
- Deployment Transaction: `0xce918a4493edac3c7c1941b334e92dd6d89f108b99bce5e71b56017acf92e161`
- Block: `7384791`

These contracts are configured in the frontend at `frontend/frontend/app/contracts/simpleBookie.ts`.

## Frontend Integration Notes

When using the dApp:
1. Connect wallet first
2. Approve USDC tokens for the market contract (one-time operation)
3. Place bets on YES or NO outcomes
4. After resolution, winning bettors can redeem their winnings