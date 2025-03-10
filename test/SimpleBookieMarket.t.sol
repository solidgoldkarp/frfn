// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/SimpleBookieMarket.sol";
import "../src/SimpleBookieFactory.sol";
import "../src/MockERC20Decimals.sol";

contract SimpleBookieMarketTest is Test {
    MockERC20Decimals usdc;
    SimpleBookieFactory factory;
    SimpleBookieMarket market;
    
    address admin = address(1);
    address alice = address(2);
    address bob = address(3);
    address charlie = address(4);
    
    uint256 constant INITIAL_BALANCE = 10000 * 10**6; // 10,000 USDC
    uint256 constant ONE_HOUR = 3600;
    
    function setUp() public {
        // Create a mock USDC token with 6 decimals
        usdc = new MockERC20Decimals("USD Coin", "USDC", 6);
        
        // Mint tokens to test accounts
        usdc.mint(admin, INITIAL_BALANCE);
        usdc.mint(alice, INITIAL_BALANCE);
        usdc.mint(bob, INITIAL_BALANCE);
        usdc.mint(charlie, INITIAL_BALANCE);
        
        // Create factory
        vm.prank(admin);
        factory = new SimpleBookieFactory(address(usdc));
        
        // Create a market
        uint256 resolutionTime = block.timestamp + 7 days;
        vm.prank(admin);
        address marketAddress = factory.createMarket("Will ETH reach $10,000 by end of 2025?", resolutionTime);
        market = SimpleBookieMarket(marketAddress);
        
        // Approve market to spend user tokens
        vm.prank(alice);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(bob);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(charlie);
        usdc.approve(address(market), type(uint256).max);
    }
    
    function testInitialState() public {
        assertEq(market.totalYes(), 0);
        assertEq(market.totalNo(), 0);
        assertEq(market.currentProbability(), 50e16); // 50%
        assertEq(market.resolved(), false);
    }
    
    function testPlaceBets() public {
        // Alice bets 1000 USDC on YES
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        // Bob bets 500 USDC on NO
        vm.prank(bob);
        market.bet(false, 500 * 10**6);
        
        // Charlie bets 1500 USDC on NO
        vm.prank(charlie);
        market.bet(false, 1500 * 10**6);
        
        // Check balances
        assertEq(market.totalYes(), 1000 * 10**6);
        assertEq(market.totalNo(), 2000 * 10**6);
        
        // Check probability: 1000 / (1000 + 2000) = 33.3%
        assertEq(market.currentProbability(), 333333333333333333);
    }
    
    function testResolveAndRedeem() public {
        // Place bets
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        vm.prank(bob);
        market.bet(false, 2000 * 10**6);
        
        // Fast forward to resolution time
        vm.warp(block.timestamp + 7 days + 1);
        
        // Admin resolves as YES
        vm.prank(admin);
        market.resolve(true);
        
        // Check market state
        assertEq(market.resolved(), true);
        assertEq(market.outcome(), true);
        
        // Alice redeems winnings
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        market.redeem();
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        
        // Alice should get her original 1000 USDC + all 2000 USDC from Bob (winning the entire pot)
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 3000 * 10**6);
        
        // Bob tries to redeem (should fail because he bet on NO)
        vm.prank(bob);
        vm.expectRevert("No winning bet");
        market.redeem();
    }
    
    function testMultipleWinners() public {
        // Alice bets 1000 USDC on YES
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        // Charlie also bets 1000 USDC on YES
        vm.prank(charlie);
        market.bet(true, 1000 * 10**6);
        
        // Bob bets 2000 USDC on NO
        vm.prank(bob);
        market.bet(false, 2000 * 10**6);
        
        // Fast forward to resolution time
        vm.warp(block.timestamp + 7 days + 1);
        
        // Admin resolves as YES
        vm.prank(admin);
        market.resolve(true);
        
        // Alice redeems
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        market.redeem();
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        
        // Charlie redeems
        uint256 charlieBalanceBefore = usdc.balanceOf(charlie);
        vm.prank(charlie);
        market.redeem();
        uint256 charlieBalanceAfter = usdc.balanceOf(charlie);
        
        // Both Alice and Charlie should get their original 1000 USDC + 1000 USDC (half of Bob's 2000)
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 2000 * 10**6);
        assertEq(charlieBalanceAfter - charlieBalanceBefore, 2000 * 10**6);
    }
    
    function testCancelMarket() public {
        // Place bets
        vm.prank(alice);
        market.bet(true, 1000 * 10**6);
        
        vm.prank(bob);
        market.bet(false, 2000 * 10**6);
        
        // Admin cancels the market
        vm.prank(admin);
        market.cancelMarket();
        
        // Market should be resolved but in a special state
        assertEq(market.resolved(), true);
        
        // Users should be able to get refunds
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        market.refund();
        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        
        // Alice should get her original 1000 USDC back
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 1000 * 10**6);
        
        // Bob should get his original 2000 USDC back
        uint256 bobBalanceBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        market.refund();
        uint256 bobBalanceAfter = usdc.balanceOf(bob);
        assertEq(bobBalanceAfter - bobBalanceBefore, 2000 * 10**6);
    }
}