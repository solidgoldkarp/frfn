# Prediction Market Deployment Guide

This guide provides step-by-step instructions for deploying and updating your prediction market contracts.

## Deployment Checklist

When deploying to a new chain:

1. **Run deployment script**:
   ```bash
   forge script script/DeployToMonad.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
   ```

2. **Capture deployed contract addresses from logs**:
   - MockERC20 (USDC): Find line with "MockERC20 (USDC) deployed to:"
   - TokenMinter: Find line with "TokenMinter deployed to:"
   - MarketFactory: Find line with "MarketFactory deployed to:"
   - PredictionMarket: Find line with "Address: [address]" under "Created prediction market"

3. **Update frontend configuration**:
   ```
   /frontend/frontend/app/contracts/addresses.ts
   ```
   
   Update these values with the addresses from your deployment logs:
   - `marketFactory`: MarketFactory address
   - `tokenMinter`: TokenMinter address
   - `testCollateral`: USDC/MockERC20 address
   - `hook`: Same as `marketFactory` (for backward compatibility)
   - `dynamicPoolBasedMinter`: Same as `tokenMinter` (for backward compatibility)

4. **Verify contract ABIs** (only needed if contracts changed):
   - MarketFactory: `/frontend/frontend/app/contracts/abis/marketFactoryAbi.ts`
   - TokenMinter: `/frontend/frontend/app/contracts/abis/tokenMinterAbi.ts`
   - PredictionMarket: `/frontend/frontend/app/contracts/abis/predictionMarketAbi.ts`
   - ERC20: `/frontend/frontend/app/contracts/abis/erc20Abi.ts`

5. **Start the frontend application**:
   ```bash
   cd frontend/frontend
   npm run dev
   ```

## Current Deployment (Monad Testnet - Chain ID: 10143)

- **MarketFactory**: `0x652D22d039AfF7d0D0fC82FB49A97Bc27ab5BC1f`
- **TokenMinter**: `0x81B8EaFBD248D3996e003db03aDFeE46b64b8DF4`
- **USDC**: Using official Monad Testnet USDC `0xf817257fed379853cDe0fa4F97AB987181B1E5Ea`
  - *Note: We've deployed a MockERC20 at `0xc96Ca92d1F49ee970Fa3d9265e08B0B19b9b1694` but switched to official token*
- **Test Market**: `0x51c3975327750FB70aB35Db3cE86428C2179cA51`
  - Question: "Will ETH price be above $10,000 by the end of 2024?"
  - Resolution Time: 1744248231

## Troubleshooting

If you encounter frontend issues after deployment:

1. **Check address configuration**:
   - Verify addresses in `addresses.ts` match your deployment logs
   - Make sure you're connected to the correct network (Chain ID: 10143 for Monad Testnet)

2. **Contract interaction errors**:
   - Ensure ABIs match deployed contract implementations
   - Check browser console for specific errors

3. **Transaction failures**:
   - Verify you have sufficient ETH for gas
   - For token operations, ensure you have approved spending

4. **Market not showing**:
   - Try refreshing the page
   - Verify the MarketFactory address is correct
   - Check that your wallet is connected to the right network

## Deployment Verification Commands

Run these commands to verify your contracts are working correctly:

```javascript
// Check if MarketFactory returns the correct market count
const marketCount = await marketFactoryContract.getMarketCount();
console.log("Market count:", marketCount.toString());

// Check if MarketFactory returns the correct market address
const marketAddress = await marketFactoryContract.getMarket(0);
console.log("Market address:", marketAddress);

// Check if TokenMinter is correctly linked to MarketFactory
const tokenMinterAddress = await marketFactoryContract.tokenMinter();
console.log("TokenMinter address:", tokenMinterAddress);
```