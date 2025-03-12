# Simple Bookie Prediction Market (FRFN Implementation)

A straightforward prediction market that follows a bookie-style betting model, implementing the Fixed-Ratio Forcing Number (FRFN) mechanism.

## SimpleBookieMarket with FRFN

The SimpleBookieMarket is a minimalist prediction market with an intuitive design that incorporates the FRFN mechanism:

- Users bet on YES/NO outcomes by depositing collateral (USDC)
- Market probability is calculated as YES bets / total bets
- The FRFN mechanism ensures market efficiency by forcing rational probability convergence
- After resolution, winners get their original bet back plus a proportional share of losing bets
- No complex AMM or virtual reserves necessary

### How it Works

1. **Betting**: Users bet YES or NO by sending USDC tokens
2. **Probability**: Simply calculated as `YES bets / total bets`
3. **FRFN Mechanism**: Driving market efficiency through rational probability convergence
4. **Resolution**: Admin resolves the market after the resolution time
5. **Redemption**: Winners redeem their original bet plus proportional share of losing side's collateral
6. **Cancellation**: Markets can be cancelled by admin in case of ambiguous outcomes or other issues

## The FRFN Mechanism

The Fixed-Ratio Forcing Number (FRFN) is the core innovation of this prediction market:

### Key Principles

- **Market Efficiency**: FRFN drives price discovery by incentivizing rational participants to bet when market odds differ from their subjective probabilities
- **Probability Forcing**: As rational actors place bets, market probabilities naturally converge toward the true probability
- **Fixed-Ratio Betting**: The system maintains simple ratios between bets and payouts, making the mathematics intuitive
- **Arbitrage Opportunities**: When market probability diverges from true probability, arbitrage opportunities arise, which market participants can exploit

### Mathematical Model

In the FRFN model, when the market probability is P and a rational actor's subjective probability is Q:

- If Q > P: The actor should bet YES
- If Q < P: The actor should bet NO
- If Q = P: The actor is indifferent

This creates a "forcing function" that pushes the market probability toward consensus. As more informed actors place bets, the market becomes increasingly efficient at predicting outcomes.

## System Architecture

The project follows a clean separation between blockchain contracts and frontend components:

```
┌─────────────────────┐      ┌───────────────────────┐
│                     │      │                       │
│  Web Application    │<────>│  Blockchain Contracts │
│  (Next.js Frontend) │      │  (Solidity)           │
│                     │      │                       │
└─────────────────────┘      └───────────────────────┘
       │                                 │
       │                                 │
       ▼                                 ▼
┌─────────────────────┐      ┌───────────────────────┐
│                     │      │                       │
│  React Components   │      │  SimpleBookieMarket   │
│  & Wagmi Hooks      │      │  & Factory Contracts  │
│                     │      │                       │
└─────────────────────┘      └───────────────────────┘
```

### Smart Contract Architecture

1. **SimpleBookieFactory**: Deploys new prediction markets
2. **SimpleBookieMarket**: Core contract implementing the FRFN mechanism with:
   - Bet management (placing YES/NO bets)
   - Probability calculation (using the FRFN mathematical model)
   - Market resolution and redemption logic

### Frontend Architecture

1. **React Components**: Modular UI components for market display and interaction
2. **Custom Hooks**: React hooks that interface with the blockchain contracts
3. **Wagmi Integration**: For wallet connection and contract interactions

## Technologies & Dependencies

### Smart Contracts
- **Solidity**: Smart contract language
- **Foundry**: Development framework for testing and deployment
- **Monad**: L2 blockchain for deployment
- **OpenZeppelin**: For standard contract implementations

### Frontend
- **Next.js**: React framework for the web application
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **Tailwind CSS**: For styling components
- **RainbowKit**: For wallet connection UI

## Project Structure

- `/src`: Smart contract source code
  - `SimpleBookieMarket.sol`: Bookie-style prediction market
  - `SimpleBookieFactory.sol`: Factory for deploying bookie markets
  - `MockERC20Decimals.sol`: ERC20 token with configurable decimals for testing

- `/web`: Next.js frontend application
  - `/app`: Main application code
    - `/components`: UI components
    - `/hooks`: React hooks for contract interactions
    - `/contracts`: ABIs and contract addresses
    - `/markets`: Market-related pages

- `/script`: Deployment scripts
  - `DeploySimpleBookieMarket.s.sol`: Deploy bookie-style markets

- `/test`: Test files
  - `SimpleBookieMarket.t.sol`: Tests for bookie-style markets
  - `SimpleBookieMarket.buying.t.sol`: Tests for buying YES/NO tokens

## Deployment

The SimpleBookieMarket has been deployed to Monad Testnet:

### Current Deployment (Using Official Monad Testnet USDC)
- USDC: `0xf817257fed379853cDe0fa4F97AB987181B1E5Ea` (Official Monad testnet USDC)
- SimpleBookieFactory: `0x16b35DECec3B0b6461917deE20039487618423C8`
- Markets:
  - BTC Price: `0xB5599ac305D498Fc4a69b8606D0f15d573510ce6`
  - AI Model: `0xc281Ec0dba64aa2332D94D3E968b46752D2EEa95`
  - Geopolitical: `0x4FAe92879Ed18fd4E0a935c38f597229df66C873`
  - Sports: `0x3FdC864abed386f0f9Ee0dA49B5f98FaBE4aAFD9`
  - Solana ATH: `0x7D9D07D3a2d7a4E15D3A8bfB301bB25c5908eAaF`

## Building and Testing

```bash
# Install dependencies
forge install

# Run tests
forge test

# Deploy (Monad testnet)
forge script script/DeploySimpleBookieMarket.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast -vvv --private-key $PRIVATE_KEY
```

## Frontend Development

The frontend is built with Next.js and uses wagmi hooks for blockchain interactions.

```bash
# Navigate to the web directory
cd web

# Install dependencies
yarn install

# Run the development server
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Features & Roadmap

- [x] FRFN mechanism for market efficiency
- [x] Basic YES/NO betting
- [x] Proportional payouts for winners
- [x] Factory for creating markets
- [x] Market cancellation and refunds
- [x] Web interface for market interaction
- [x] Monad Testnet deployment with multiple markets
- [ ] FRFN extension to multi-outcome markets (beyond binary YES/NO)
- [ ] Fee structure for market creators
- [ ] DAO governance for market resolution disputes
- [ ] Integration with oracle services
- [ ] Advanced FRFN-based arbitrage tools

## License

**PROPRIETARY AND CONFIDENTIAL**

Copyright (c) 2025 SolidGoldKarp (SGM). All Rights Reserved.

This code is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this code, via any medium, is strictly prohibited without express written permission from SolidGoldKarp (SGM).

See the LICENSE file for full terms.