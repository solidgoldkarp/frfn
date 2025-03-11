# Simple Bookie Prediction Market

A straightforward prediction market that follows a bookie-style betting model.

## SimpleBookieMarket

The SimpleBookieMarket is a minimalist prediction market with an intuitive design:

- Users bet on YES/NO outcomes by depositing collateral (USDC)
- Market probability is calculated as YES bets / total bets
- After resolution, winners get their original bet back plus a proportional share of losing bets
- No complex AMM or virtual reserves necessary

### How it Works

1. **Betting**: Users bet YES or NO by sending USDC tokens
2. **Probability**: Simply calculated as `YES bets / total bets`
3. **Resolution**: Admin resolves the market after the resolution time
4. **Redemption**: Winners redeem their original bet plus proportional share of losing side's collateral
5. **Cancellation**: Markets can be cancelled by admin in case of ambiguous outcomes or other issues

## Project Structure

- `/src`: Smart contract source code
  - `SimpleBookieMarket.sol`: Bookie-style prediction market
  - `SimpleBookieFactory.sol`: Factory for deploying bookie markets
  - `MockERC20Decimals.sol`: ERC20 token with configurable decimals for testing

- `/frontend`: Next.js frontend application (in separate repo)
  - `/markets/simple`: Simple bookie-style market pages

- `/script`: Deployment scripts
  - `DeploySimpleBookieMarket.s.sol`: Deploy bookie-style markets

- `/test`: Test files
  - `SimpleBookieMarket.t.sol`: Tests for bookie-style markets
  - `SimpleBookieMarket.buying.t.sol`: Tests for buying YES/NO tokens

- `/archive`: Previous AMM-based implementation (for reference)

## Deployment

The SimpleBookieMarket has been deployed to Monad Testnet:

### Current Deployment (Using Official Monad Testnet USDC)
- USDC: `0xf817257fed379853cDe0fa4F97AB987181B1E5Ea` (Official Monad testnet USDC)
- SimpleBookieFactory: `0xdB146BE10C84EE31b6B7eB5dF91018158CC24612`
- Test Market: `0x27497b50aF8f400f8457243FD2775fE71eec5825`
- Deployment Transaction: `0xce918a4493edac3c7c1941b334e92dd6d89f108b99bce5e71b56017acf92e161`

## Building and Testing

```bash
# Install dependencies
forge install

# Run tests
forge test

# Deploy (Monad testnet)
forge script script/DeploySimpleBookieMarket.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast -vvv --private-key $PRIVATE_KEY
```

## Frontend

The frontend is built with Next.js and uses wagmi hooks for blockchain interactions.

```bash
cd frontend
npm install
npm run dev
```

## Features & Roadmap

- [x] Basic YES/NO betting
- [x] Proportional payouts for winners
- [x] Factory for creating markets
- [x] Market cancellation and refunds
- [ ] Multi-outcome markets (beyond binary YES/NO)
- [ ] Fee structure for market creators
- [ ] DAO governance for market resolution disputes
- [ ] Integration with oracle services

## License

MIT