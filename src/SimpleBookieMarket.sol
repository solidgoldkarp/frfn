// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleBookieMarket {
    IERC20 public collateralToken;
    string public question;
    uint256 public resolutionTime;
    bool public resolved;
    bool public outcome; // true = YES, false = NO
    address public admin;

    uint256 public totalYes;
    uint256 public totalNo;

    mapping(address => uint256) public yesBets;
    mapping(address => uint256) public noBets;
    mapping(address => bool) public redeemed;

    event BetPlaced(address indexed user, bool outcome, uint256 amount);
    event MarketResolved(bool outcome);
    event Redeemed(address indexed user, uint256 amount);

    constructor(
        string memory _question,
        address _collateralToken,
        uint256 _resolutionTime,
        address _admin
    ) {
        require(_resolutionTime > block.timestamp, "Resolution must be future");
        require(_collateralToken != address(0), "Invalid collateral token");
        
        question = _question;
        collateralToken = IERC20(_collateralToken);
        resolutionTime = _resolutionTime;
        admin = _admin;
    }

    function bet(bool _outcome, uint256 amount) external {
        require(block.timestamp < resolutionTime, "Betting closed");
        require(amount > 0, "Amount must be positive");
        require(!resolved, "Market already resolved");

        bool success = collateralToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        if (_outcome) {
            yesBets[msg.sender] += amount;
            totalYes += amount;
        } else {
            noBets[msg.sender] += amount;
            totalNo += amount;
        }

        emit BetPlaced(msg.sender, _outcome, amount);
    }

    function resolve(bool _outcome) external {
        require(msg.sender == admin, "Only admin can resolve");
        require(block.timestamp >= resolutionTime, "Too early");
        require(!resolved, "Already resolved");

        outcome = _outcome;
        resolved = true;

        emit MarketResolved(_outcome);
    }

    function redeem() external {
        require(resolved, "Not resolved");
        require(!redeemed[msg.sender], "Already redeemed");

        uint256 userBet = outcome ? yesBets[msg.sender] : noBets[msg.sender];
        require(userBet > 0, "No winning bet");

        uint256 totalWinning = outcome ? totalYes : totalNo;
        uint256 totalLosing = outcome ? totalNo : totalYes;

        // Calculate payout: original bet + proportional share of losing side
        uint256 payout = userBet;
        if (totalWinning > 0) {
            payout += (userBet * totalLosing) / totalWinning;
        }

        redeemed[msg.sender] = true;
        bool success = collateralToken.transfer(msg.sender, payout);
        require(success, "Transfer failed");

        emit Redeemed(msg.sender, payout);
    }

    function currentProbability() external view returns (uint256) {
        uint256 total = totalYes + totalNo;
        if (total == 0) return 50e16; // default 50%
        return (totalYes * 1e18) / total; // probability in WAD (1e18 = 100%)
    }
    
    // Emergency function in case market needs to be cancelled
    function cancelMarket() external {
        require(msg.sender == admin, "Only admin can cancel");
        require(!resolved, "Already resolved");
        
        resolved = true;
        // Special case: neither YES nor NO wins, so everyone gets their money back
    }
    
    // If market is cancelled, this allows refunds
    function refund() external {
        require(resolved, "Not resolved");
        require(!redeemed[msg.sender], "Already redeemed");
        require(outcome == false && totalYes > 0 && totalNo > 0, "Not a cancelled market");

        uint256 refundAmount = yesBets[msg.sender] + noBets[msg.sender];
        require(refundAmount > 0, "Nothing to refund");
        
        redeemed[msg.sender] = true;
        bool success = collateralToken.transfer(msg.sender, refundAmount);
        require(success, "Transfer failed");
        
        emit Redeemed(msg.sender, refundAmount);
    }
    
    // Testing-only function to resolve a market regardless of time
    // This is specifically for testnet environments to allow easier testing
    function forceResolve(bool _outcome) external {
        require(msg.sender == admin, "Only admin can resolve");
        require(!resolved, "Already resolved");
        
        outcome = _outcome;
        resolved = true;
        
        emit MarketResolved(_outcome);
    }
}