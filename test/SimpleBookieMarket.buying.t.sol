// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/SimpleBookieMarket.sol";
import "../src/SimpleBookieFactory.sol";
import "../src/MockERC20Decimals.sol";

contract SimpleBookieMarketBuyingTest is Test {
    MockERC20Decimals usdc;
    SimpleBookieFactory factory;
    SimpleBookieMarket market;
    
    address admin = address(1);
    address alice = address(2);
    address bob = address(3);
    address charlie = address(4);
    
    uint256 constant INITIAL_BALANCE = 10000 * 10**6; // 10,000 USDC
    uint256 RESOLUTION_TIME; // Will be set in setUp
    
    function setUp() public {
        // Set resolution time
        RESOLUTION_TIME = block.timestamp + 7 days;
        
        // Create a mock USDC token with 6 decimals
        usdc = new MockERC20Decimals("USD Coin", "USDC", 6);
        
        // Mint tokens to test accounts
        usdc.mint(admin, INITIAL_BALANCE);
        usdc.mint(alice, INITIAL_BALANCE);
        usdc.mint(bob, INITIAL_BALANCE);
        usdc.mint(charlie, INITIAL_BALANCE);
        
        // Create factory
        vm.startPrank(admin);
        factory = new SimpleBookieFactory(address(usdc));
        
        // Create a market
        market = SimpleBookieMarket(factory.createMarket(
            "Will ETH reach $10,000 by end of 2025?", 
            RESOLUTION_TIME
        ));
        vm.stopPrank();
        
        // Approve market to spend tokens for all users
        vm.prank(alice);
        usdc.approve(address(market), type(uint256).max);
        
        vm.prank(bob);
        usdc.approve(address(market), type(uint256).max);
        
        vm.prank(charlie);
        usdc.approve(address(market), type(uint256).max);
    }
    
    function testInitialMarketState() public {
        // Check initial market state
        assertEq(market.totalYes(), 0);
        assertEq(market.totalNo(), 0);
        assertEq(market.currentProbability(), 50e16, "Initial probability should be 50%");
        assertEq(market.resolved(), false, "Market should not be resolved initially");
    }
    
    function testBuyYesToken() public {
        uint256 betAmount = 1000 * 10**6; // 1,000 USDC
        
        // Record balances before betting
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        uint256 marketBalanceBefore = usdc.balanceOf(address(market));
        
        // Alice bets on YES
        vm.prank(alice);
        market.bet(true, betAmount);
        
        // Check balances after betting
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        uint256 marketBalanceAfter = usdc.balanceOf(address(market));
        
        // Verify token transfers
        assertEq(aliceBalanceBefore - aliceBalanceAfter, betAmount, "Alice should have spent the bet amount");
        assertEq(marketBalanceAfter - marketBalanceBefore, betAmount, "Market should have received the bet amount");
        
        // Verify bet was recorded
        assertEq(market.yesBets(alice), betAmount, "YES bet should be recorded for Alice");
        assertEq(market.totalYes(), betAmount, "Total YES bets should be updated");
        
        // Verify probability updated
        // After 1,000 USDC bet on YES and 0 on NO, probability should be 100%
        // But our contract clamps it to avoid division by zero, so we check it's high
        uint256 probability = market.currentProbability();
        assertGt(probability, 95e16, "Probability should be close to 100% after YES bet");
    }
    
    function testBuyNoToken() public {
        uint256 betAmount = 1000 * 10**6; // 1,000 USDC
        
        // Record balances before betting
        uint256 bobBalanceBefore = usdc.balanceOf(bob);
        uint256 marketBalanceBefore = usdc.balanceOf(address(market));
        
        // Bob bets on NO
        vm.prank(bob);
        market.bet(false, betAmount);
        
        // Check balances after betting
        uint256 bobBalanceAfter = usdc.balanceOf(bob);
        uint256 marketBalanceAfter = usdc.balanceOf(address(market));
        
        // Verify token transfers
        assertEq(bobBalanceBefore - bobBalanceAfter, betAmount, "Bob should have spent the bet amount");
        assertEq(marketBalanceAfter - marketBalanceBefore, betAmount, "Market should have received the bet amount");
        
        // Verify bet was recorded
        assertEq(market.noBets(bob), betAmount, "NO bet should be recorded for Bob");
        assertEq(market.totalNo(), betAmount, "Total NO bets should be updated");
        
        // Verify probability updated
        // After 0 USDC bet on YES and 1,000 on NO, probability should be close to 0%
        uint256 probability = market.currentProbability();
        assertLt(probability, 5e16, "Probability should be close to 0% after NO bet");
    }
    
    function testMultipleBetsChangesProbability() public {
        // First bet: Alice bets 1,000 USDC on YES
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        // Check probability after first bet
        uint256 probabilityAfterFirstBet = market.currentProbability();
        assertGt(probabilityAfterFirstBet, 95e16, "Probability should be close to 100% after first YES bet");
        
        // Second bet: Bob bets 1,000 USDC on NO
        vm.prank(bob);
        market.bet(false, 1000 * 10**6);
        
        // Check probability after second bet
        // Now we have 1,000 YES and 1,000 NO, so probability should be 50%
        uint256 probabilityAfterSecondBet = market.currentProbability();
        assertEq(probabilityAfterSecondBet, 50e16, "Probability should be 50% with equal YES/NO bets");
        
        // Third bet: Charlie bets 3,000 USDC on NO
        vm.prank(charlie);
        market.bet(false, 3000 * 10**6);
        
        // Check probability after third bet
        // Now we have 1,000 YES and 4,000 NO, so probability should be 20%
        uint256 probabilityAfterThirdBet = market.currentProbability();
        assertEq(probabilityAfterThirdBet, 20e16, "Probability should be 20% with 1000 YES and 4000 NO");
    }
    
    function testBetAmountImpactsProbability() public {
        // Test different bet amounts and verify probability changes accordingly
        
        // Alice bets 100 USDC on YES
        vm.prank(alice);
        market.bet(true, 100 * 10**6);
        
        // Check probability - 100 YES, 0 NO = ~100%
        uint256 probability1 = market.currentProbability();
        assertGt(probability1, 95e16);
        
        // Bob bets 100 USDC on NO
        vm.prank(bob);
        market.bet(false, 100 * 10**6);
        
        // Check probability - 100 YES, 100 NO = 50%
        uint256 probability2 = market.currentProbability();
        assertEq(probability2, 50e16);
        
        // Charlie bets 300 USDC on NO
        vm.prank(charlie);
        market.bet(false, 300 * 10**6);
        
        // Check probability - 100 YES, 400 NO = 20%
        uint256 probability3 = market.currentProbability();
        assertEq(probability3, 20e16);
        
        // Alice bets another 400 USDC on YES
        vm.prank(alice);
        market.bet(true, 400 * 10**6);
        
        // Check probability - 500 YES, 400 NO = 55.56%
        uint256 probability4 = market.currentProbability();
        assertApproxEqAbs(probability4, 556e15, 1e15, "Probability should be ~55.6% with 500 YES and 400 NO");
    }
    
    function testCannotBetAfterResolutionTime() public {
        // Fast forward to after resolution time
        vm.warp(RESOLUTION_TIME + 1);
        
        // Try to place a bet
        vm.prank(alice);
        vm.expectRevert("Betting closed");
        market.bet(true, 1000 * 10**6);
    }
    
    function testCannotBetOnResolvedMarket() public {
        // Fast forward to resolution time first
        vm.warp(RESOLUTION_TIME + 1);
        
        // Admin resolves the market
        vm.prank(admin);
        market.resolve(true);
        
        // Try to place a bet
        vm.prank(alice);
        vm.expectRevert("Betting closed");
        market.bet(true, 1000 * 10**6);
    }
    
    function testMarketResolutionAndWinnings() public {
        // Alice bets 1,000 USDC on YES
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        // Bob bets 2,000 USDC on NO
        vm.prank(bob);
        market.bet(false, 2000 * 10**6);
        
        // Charlie bets 500 USDC on YES
        vm.prank(charlie);
        market.bet(true, 500 * 10**6);
        
        // Check total bets
        assertEq(market.totalYes(), 1500 * 10**6, "Total YES should be 1,500 USDC");
        assertEq(market.totalNo(), 2000 * 10**6, "Total NO should be 2,000 USDC");
        
        // Fast forward to resolution time
        vm.warp(RESOLUTION_TIME + 1);
        
        // Resolve market as YES
        vm.prank(admin);
        market.resolve(true);
        
        assertEq(market.resolved(), true, "Market should be resolved");
        assertEq(market.outcome(), true, "Outcome should be YES");
        
        // Calculate expected winnings for Alice (YES bettor)
        // Alice bet 1,000 USDC, total YES bets are 1,500 USDC
        // So Alice gets 1,000 + (1,000/1,500 × 2,000) = 1,000 + 1,333.33 = 2,333.33 USDC
        uint256 aliceBet = 1000 * 10**6;
        uint256 totalYesBets = 1500 * 10**6;
        uint256 totalNoBets = 2000 * 10**6;
        
        // Calculate share: (aliceBet / totalYesBets) * totalNoBets
        uint256 aliceShare = (aliceBet * totalNoBets) / totalYesBets;
        uint256 aliceExpectedWinnings = aliceBet + aliceShare;
        
        // Alice redeems her winnings
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        market.redeem();
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        
        assertEq(aliceBalanceAfter - aliceBalanceBefore, aliceExpectedWinnings, "Alice should receive correct winnings");
        
        // Charlie redeems his winnings
        uint256 charlieBet = 500 * 10**6;
        // Calculate share: (charlieBet / totalYesBets) * totalNoBets
        uint256 charlieShare = (charlieBet * totalNoBets) / totalYesBets;
        uint256 charlieExpectedWinnings = charlieBet + charlieShare;
        uint256 charlieBalanceBefore = usdc.balanceOf(charlie);
        vm.prank(charlie);
        market.redeem();
        uint256 charlieBalanceAfter = usdc.balanceOf(charlie);
        
        assertEq(charlieBalanceAfter - charlieBalanceBefore, charlieExpectedWinnings, "Charlie should receive correct winnings");
        
        // Bob (NO bettor) tries to redeem, should fail
        vm.prank(bob);
        vm.expectRevert("No winning bet");
        market.redeem();
    }
    
    function testCancelledMarketRefunds() public {
        // Alice bets 1,000 USDC on YES
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        // Bob bets 2,000 USDC on NO
        vm.prank(bob);
        market.bet(false, 2000 * 10**6);
        
        // Cancel the market
        vm.prank(admin);
        market.cancelMarket();
        
        // Alice gets a refund
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        market.refund();
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 1000 * 10**6, "Alice should be refunded her bet amount");
        
        // Bob gets a refund
        uint256 bobBalanceBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        market.refund();
        uint256 bobBalanceAfter = usdc.balanceOf(bob);
        
        assertEq(bobBalanceAfter - bobBalanceBefore, 2000 * 10**6, "Bob should be refunded his bet amount");
    }
}