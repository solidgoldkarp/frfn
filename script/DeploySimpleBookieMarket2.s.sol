// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../src/SimpleBookieFactory.sol";

contract DeploySimpleBookieMarket2Script is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Use official Monad testnet USDC
        address officialUSDC = 0xf817257fed379853cDe0fa4F97AB987181B1E5Ea;
        console.log("Using official Monad testnet USDC at:", officialUSDC);
        
        // Deploy factory using official USDC as collateral
        SimpleBookieFactory factory = new SimpleBookieFactory(officialUSDC);
        console.log("SimpleBookieFactory deployed at:", address(factory));
        
        // Create a test market (30 days from now)
        uint256 resolutionTime = block.timestamp + 30 days;
        address market = factory.createMarket("Will BTC hit $100k by end of 2024?", resolutionTime);
        console.log("First test market deployed at:", market);
        
        vm.stopBroadcast();
    }
}