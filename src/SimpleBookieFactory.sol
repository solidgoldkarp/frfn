// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./SimpleBookieMarket.sol";

contract SimpleBookieFactory {
    address public owner;
    address public collateralToken;
    
    SimpleBookieMarket[] public markets;
    mapping(address => bool) public isMarket;

    event MarketCreated(address indexed market, string question, uint256 resolutionTime);

    constructor(address _collateralToken) {
        require(_collateralToken != address(0), "Invalid collateral token");
        owner = msg.sender;
        collateralToken = _collateralToken;
    }
    
    function createMarket(string memory question, uint256 resolutionTime) external returns (address) {
        require(resolutionTime > block.timestamp, "Resolution time must be in the future");
        
        SimpleBookieMarket market = new SimpleBookieMarket(
            question,
            collateralToken,
            resolutionTime,
            msg.sender // Market creator is the admin
        );
        
        markets.push(market);
        isMarket[address(market)] = true;
        
        emit MarketCreated(address(market), question, resolutionTime);
        return address(market);
    }
    
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }
    
    function getMarket(uint256 index) external view returns (address) {
        require(index < markets.length, "Index out of bounds");
        return address(markets[index]);
    }
    
    function setCollateralToken(address _collateralToken) external {
        require(msg.sender == owner, "Only owner can change collateral token");
        require(_collateralToken != address(0), "Invalid collateral token");
        collateralToken = _collateralToken;
    }
}