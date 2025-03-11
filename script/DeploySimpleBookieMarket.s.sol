// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../src/SimpleBookieFactory.sol";
import "../src/MockERC20Decimals.sol";

// Explicitly comment out any Uniswap-related imports that might be referenced
// import "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

contract DeploySimpleBookieMarketScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Use official Monad testnet USDC
        address officialUSDC = 0xf817257fed379853cDe0fa4F97AB987181B1E5Ea;
        console.log("Using official Monad testnet USDC at:", officialUSDC);
        
        // Deploy factory using official USDC as collateral
        SimpleBookieFactory factory = new SimpleBookieFactory(officialUSDC);
        console.log("SimpleBookieFactory deployed at:", address(factory));
        
        // Create multiple test markets with various topics and timeframes
        uint256 baseResolutionTime = block.timestamp;
        
        // Market 1: Crypto price prediction
        address market1 = factory.createMarket("Will BTC reach $150k before April 2025?", baseResolutionTime + 30 days);
        console.log("Market 1 (BTC price) deployed at:", market1);
        
        // Market 2: AI development prediction
        address market2 = factory.createMarket("Will Google have the best AI model by end of April 2025?", baseResolutionTime + 45 days);
        console.log("Market 2 (AI model) deployed at:", market2);
        
        // Market 3: Geopolitical event
        address market3 = factory.createMarket("Will Russia-Ukraine ceasefire happen in 2025?", baseResolutionTime + 60 days);
        console.log("Market 3 (Geopolitical) deployed at:", market3);
        
        // Market 4: Sports outcome
        address market4 = factory.createMarket("Will Boston Celtics win the NBA Championship?", baseResolutionTime + 90 days);
        console.log("Market 4 (Sports) deployed at:", market4);
        
        // Market 5: Tech industry prediction
        address market5 = factory.createMarket("Will Solana reach all-time high before 2026?", baseResolutionTime + 120 days);
        console.log("Market 5 (Solana ATH) deployed at:", market5);
        
        // Add automatic deprecation time for beta testing
        // TODO: Implement isActive modifier in contracts for automatic deprecation
        
        vm.stopBroadcast();
    }
}