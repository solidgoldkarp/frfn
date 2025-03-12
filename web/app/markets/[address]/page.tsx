'use client';

import React, { useState, useEffect } from 'react';
import { useSimpleMarket } from '../../hooks/useSimpleMarket';
import { formatProbability } from '../../utils/format';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { useTokenApproval } from '../../hooks/useTokenApproval';
import { simpleBookie } from '../../contracts/simpleBookie';

// Note: calculateTimeRemaining function is defined at the bottom of the file

interface PageProps {
  params: {
    address: string;
  };
}

const MarketPage: React.FC<PageProps> = ({ params }) => {
  const marketAddress = params.address as `0x${string}`;
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  // Form state for betting
  const [betAmount, setBetAmount] = useState<string>('10');
  const [hasApproval, setHasApproval] = useState<boolean>(false);
  const [isApprovingManually, setIsApprovingManually] = useState<boolean>(false);
  const [isVerifyingApproval, setIsVerifyingApproval] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  
  // Set initial values after component mounts to prevent hydration errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBetAmount('10');
    }
  }, []);
  
  // Token address for approval
  const tokenAddress = simpleBookie.monadTestnet.usdc as `0x${string}`;
  
  // Get market data
  const { 
    question, 
    resolutionTime, 
    probability, 
    totalYes, 
    totalNo, 
    isResolved, 
    finalOutcome,
    userYesBets,
    userNoBets,
    placeBetYes,
    placeBetNo,
    redeemWinnings,
    isLoading: isMarketLoading
  } = useSimpleMarket(marketAddress);
  
  // Token approval
  const {
    isApproved,
    approveToken,
    isApproving,
    refetchAllowance,
    allowance
  } = useTokenApproval(tokenAddress, marketAddress, address, 6);
  
  // Check for existing approval when the page loads
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window !== "undefined" && isConnected && marketAddress) {
      console.log("Checking USDC approval for market:", marketAddress);
      setIsVerifyingApproval(true);
      
      // Force a refresh of the allowance when market changes
      refetchAllowance().then(() => {
        if (allowance && allowance > 0n) {
          console.log("User has approved USDC for this market:", formatUnits(allowance, 6), "USDC");
          setHasApproval(true);
          
          // Auto-set the bet amount to 10 USDC if not already set
          if (!betAmount) {
            setBetAmount('10');
          }
        } else {
          console.log("User has not approved USDC for this market");
          setHasApproval(false);
        }
        setIsVerifyingApproval(false);
      }).catch(error => {
        console.error("Error checking allowance:", error);
        setIsVerifyingApproval(false);
      });
    }
  }, [isConnected, marketAddress, refetchAllowance, allowance, betAmount]);
  
  // Check if amount is approved
  const checkAndApprove = async (amount: string) => {
    if (!isConnected || !marketAddress) {
      alert("Please connect your wallet first");
      return false;
    }

    // Skip approval check if we already know the user has approval
    if (hasApproval) {
      return true;
    }
    
    // Check if specifically the amount is approved (for extra safety)
    if (!isApproved(amount)) {
      alert("Please approve USDC first by clicking the 'Approve USDC' button above.");
      return false;
    }
    
    return true;
  };
  
  // Handle bet YES
  const handleBetYes = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    try {
      setTxStatus('pending');
      // First check and approve if needed
      const approved = await checkAndApprove(betAmount);
      if (!approved) {
        setTxStatus('idle');
        return;
      }
      
      // Then place bet
      await placeBetYes(betAmount);
      setTxStatus('success');
      setBetAmount('');
    } catch (error) {
      console.error('Error placing YES bet:', error);
      setTxStatus('error');
      alert(`Error placing YES bet: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle bet NO
  const handleBetNo = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    try {
      setTxStatus('pending');
      // First check and approve if needed
      const approved = await checkAndApprove(betAmount);
      if (!approved) {
        setTxStatus('idle');
        return;
      }
      
      // Then place bet
      await placeBetNo(betAmount);
      setTxStatus('success');
      setBetAmount('');
    } catch (error) {
      console.error('Error placing NO bet:', error);
      setTxStatus('error');
      alert(`Error placing NO bet: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle redeem
  const handleRedeem = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    try {
      setTxStatus('pending');
      await redeemWinnings();
      setTxStatus('success');
    } catch (error) {
      console.error('Error redeeming:', error);
      setTxStatus('error');
    }
  };
  
  // Calculate price impact for a given bet amount
  const calculatePriceImpact = (amount: string, isYes: boolean): number => {
    if (!amount || !totalYes || !totalNo) return 0;
    
    const betAmount = BigInt(parseFloat(amount) * 1000000); // Convert to USDC decimals
    const currentYes = BigInt(totalYes);
    const currentNo = BigInt(totalNo);
    
    // Current probability
    let currentProb = 50;
    if (currentYes + currentNo > 0n) {
      currentProb = Number((currentYes * 100n) / (currentYes + currentNo));
    }
    
    // New probability after bet
    let newProb = currentProb;
    if (isYes) {
      newProb = Number(((currentYes + betAmount) * 100n) / (currentYes + currentNo + betAmount));
    } else {
      newProb = Number((currentYes * 100n) / (currentYes + currentNo + betAmount));
    }
    
    // Price impact is the difference in probability
    return isYes ? newProb - currentProb : currentProb - newProb;
  };
  
  // Calculate expected payout for a bet
  const calculateExpectedPayout = (amount: string, isYes: boolean): number => {
    if (!amount || !totalYes || !totalNo) return 0;
    
    const betAmount = parseFloat(amount);
    const currentYes = Number(formatUnits(BigInt(totalYes), 6));
    const currentNo = Number(formatUnits(BigInt(totalNo), 6));
    
    if (isYes) {
      // YES bet payout: Original bet + (bet * totalNO / totalYES) if YES wins
      return currentYes > 0 ? betAmount + (betAmount * currentNo / (currentYes + betAmount)) : betAmount;
    } else {
      // NO bet payout: Original bet + (bet * totalYES / totalNO) if NO wins
      return currentNo > 0 ? betAmount + (betAmount * currentYes / (currentNo + betAmount)) : betAmount;
    }
  };
  
  // Calculate current implied odds
  const calculateImpliedOdds = (probabilityPercent: number): string => {
    if (probabilityPercent <= 0 || probabilityPercent >= 100) return "N/A";
    
    // Convert percentage to decimal odds
    const decimalOdds = 100 / probabilityPercent;
    return decimalOdds.toFixed(2);
  };
  
  // State for displaying more detailed AMM-like info
  const [showTradePreview, setShowTradePreview] = useState<boolean>(false);
  const [previewSide, setPreviewSide] = useState<'YES' | 'NO'>('YES');
  
  // Loading state with spinner
  if (isMarketLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/markets">
            <Button variant="ghost" className="mb-2">
              ← Back to Markets
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            <p className="mt-4 text-gray-400">Loading market details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Helper function to format time remaining
  const calculateTimeRemaining = (timestamp: number | undefined): string => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) {
      return "Ended";
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link href="/markets">
              <Button variant="ghost" className="mb-2">
                ← Back to Markets
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{question || "Loading..."}</h1>
            <div className="mt-2 text-gray-400">
              Resolves: {resolutionTime ? new Date(resolutionTime * 1000).toLocaleString() : "Loading..."}
              {resolutionTime && ` (${calculateTimeRemaining(resolutionTime)})`}
            </div>
          </div>
        </div>
        
        {/* Transaction Status Banner */}
        {isConnected && txStatus === 'pending' && (
          <div className="bg-yellow-800 text-white p-3 rounded-lg mb-4 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Transaction in progress...</span>
          </div>
        )}
        
        {isConnected && txStatus === 'success' && (
          <div className="bg-green-800 text-white p-3 rounded-lg mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Transaction successful!</span>
          </div>
        )}
        
        {isConnected && txStatus === 'error' && (
          <div className="bg-red-800 text-white p-3 rounded-lg mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            <span>Transaction failed. Please try again.</span>
          </div>
        )}
        
        {/* Market Status */}
        <div className="p-5 mb-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Current Probability</div>
              <div className="text-2xl font-bold">{formatProbability(probability || 50)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Status</div>
              <div className={`font-bold ${isResolved ? 'text-yellow-400' : 'text-green-400'}`}>
                {isResolved 
                  ? `Resolved: ${finalOutcome ? 'YES' : 'NO'}` 
                  : 'Active'}
              </div>
            </div>
          </div>
          
          {/* Probability Bar */}
          <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-green-600 h-full flex items-center justify-center text-xs font-semibold"
                style={{ width: `${probability || 50}%` }}
              >
                YES
              </div>
              <div 
                className="bg-red-600 h-full flex items-center justify-center text-xs font-semibold"
                style={{ width: `${100 - (probability || 50)}%` }}
              >
                NO
              </div>
            </div>
          </div>
          
          {/* Enhanced Statistics */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400">YES Price</div>
              <div className="text-xl font-semibold">
                {formatProbability(probability || 50)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Implied Odds: {calculateImpliedOdds(probability || 50)}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400">NO Price</div>
              <div className="text-xl font-semibold">
                {formatProbability(100 - (probability || 50))}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Implied Odds: {calculateImpliedOdds(100 - (probability || 50))}
              </div>
            </div>
          </div>
          
          {/* Pool Liquidity - Enhanced with AMM terminology */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold">Pool Liquidity</h3>
              <div className="text-xs text-gray-400">
                Total: {totalYes && totalNo 
                  ? formatUnits(BigInt(totalYes) + BigInt(totalNo), 6) 
                  : "0"} USDC
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-3 rounded-lg border border-green-700">
                <div className="text-sm text-gray-400">YES Liquidity</div>
                <div className="text-lg font-bold text-green-400">
                  {totalYes ? formatUnits(BigInt(totalYes), 6) : "0"} USDC
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg border border-red-700">
                <div className="text-sm text-gray-400">NO Liquidity</div>
                <div className="text-lg font-bold text-red-400">
                  {totalNo ? formatUnits(BigInt(totalNo), 6) : "0"} USDC
                </div>
              </div>
            </div>
          </div>
          
          {/* Price Impact Visualization */}
          {!isResolved && (
            <div className="mt-5">
              <h3 className="text-md font-semibold mb-2">Price Impact</h3>
              <div className="relative h-44 w-full bg-gray-700 rounded-lg overflow-hidden">
                <div className="absolute inset-0 p-2">
                  {/* Y-axis label */}
                  <div className="absolute left-2 top-0 text-xs text-gray-400">Price</div>
                  
                  {/* X-axis label */}
                  <div className="absolute bottom-0 right-2 text-xs text-gray-400">Bet Size</div>
                  
                  {/* Current price line */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-yellow-500" 
                       style={{ top: `${100 - (probability || 50)}%` }}>
                    <div className="absolute right-1 top-0 transform -translate-y-3 bg-gray-800 px-1 text-xs text-yellow-500">
                      Current: {(probability || 50).toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Liquidity curve simplified for bookie market */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* YES price curve (lower = higher price) - simplified for bookie market */}
                    <path 
                      d={`M0,${100 - (probability || 50)} Q30,${100 - (probability || 50) - 10} 50,${100 - (probability || 50) - 15} T100,${100 - (probability || 50) - 20}`} 
                      stroke="rgb(34, 197, 94)" 
                      strokeWidth="2" 
                      fill="none" 
                    />
                    
                    {/* NO price curve (higher = higher price) - simplified for bookie market */}
                    <path 
                      d={`M0,${100 - (probability || 50)} Q30,${100 - (probability || 50) + 10} 50,${100 - (probability || 50) + 15} T100,${100 - (probability || 50) + 20}`} 
                      stroke="rgb(239, 68, 68)" 
                      strokeWidth="2" 
                      fill="none" 
                    />
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute bottom-1 left-1 flex items-center space-x-3 text-xs">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 mr-1"></div>
                      <span>YES</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-red-500 mr-1"></div>
                      <span>NO</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">
                Estimated price impact based on bet size
              </div>
            </div>
          )}
        </div>
        
        {/* User Position */}
        {isConnected && (
          <div className="p-5 mb-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Your Position</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Your YES Bets</div>
                <div className="text-lg font-bold text-green-400">
                  {userYesBets ? formatUnits(BigInt(userYesBets), 6) : "0"} USDC
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Your NO Bets</div>
                <div className="text-lg font-bold text-red-400">
                  {userNoBets ? formatUnits(BigInt(userNoBets), 6) : "0"} USDC
                </div>
              </div>
            </div>
            
            {/* Potential Winnings (simplified calculation) */}
            {(userYesBets && BigInt(userYesBets) > 0n) || (userNoBets && BigInt(userNoBets) > 0n) ? (
              <div className="bg-gray-700 p-3 rounded-lg mb-4">
                <div className="text-sm text-gray-400">Potential Winnings</div>
                <div className="flex flex-col">
                  {userYesBets && BigInt(userYesBets) > 0n && (
                    <div className="text-sm">
                      If YES wins: <span className="font-bold text-green-400">
                        {totalYes && totalNo && BigInt(totalYes) > 0n
                          ? formatUnits(
                              BigInt(userYesBets) + 
                              (BigInt(userYesBets) * BigInt(totalNo)) / BigInt(totalYes), 
                              6
                            )
                          : "0"} USDC
                      </span>
                    </div>
                  )}
                  {userNoBets && BigInt(userNoBets) > 0n && (
                    <div className="text-sm">
                      If NO wins: <span className="font-bold text-red-400">
                        {totalYes && totalNo && BigInt(totalNo) > 0n
                          ? formatUnits(
                              BigInt(userNoBets) + 
                              (BigInt(userNoBets) * BigInt(totalYes)) / BigInt(totalNo), 
                              6
                            )
                          : "0"} USDC
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
        
        {/* Trading Interface */}
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700">
          {!isResolved ? (
            // Active market - show betting interface
            <>
              <h2 className="text-xl font-semibold mb-4">Place a Bet</h2>
              
              {/* Token Approval Section - Only visible when connected and not approved */}
              {typeof window !== 'undefined' && isConnected && !hasApproval && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Token Approval Required</h3>
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-300 mb-3">
                      <span className="font-bold">⚠️ Before you can bet</span>, you need to approve USDC for this market. 
                      This is a one-time approval that lets the contract use your USDC tokens.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          setIsApprovingManually(true);
                          setTxStatus('pending');
                          // Call approve token function
                          const tx = await approveToken();
                          console.log("Approval transaction submitted:", tx.hash);
                          
                          // Use the publicClient to wait for the transaction
                          if (tx.hash) {
                            await publicClient.waitForTransactionReceipt({ hash: tx.hash });
                            console.log("Approval transaction confirmed");
                            setIsVerifyingApproval(true);
                            
                            // Now explicitly check the allowance multiple times to ensure it's updated
                            const checkAllowanceWithRetry = async (retries = 5) => {
                              console.log(`Checking allowance (${retries} retries left)`);
                              await refetchAllowance();
                              
                              if (allowance && allowance > 0n) {
                                console.log("✅ Approval confirmed:", formatUnits(allowance, 6), "USDC");
                                setHasApproval(true);
                                setTxStatus('success');
                                return true;
                              } else if (retries > 0) {
                                console.log("Approval not yet reflected, retrying...");
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                return checkAllowanceWithRetry(retries - 1);
                              } else {
                                console.log("❌ Failed to verify approval after multiple attempts");
                                setTxStatus('error');
                                return false;
                              }
                            };
                            
                            await checkAllowanceWithRetry();
                          }
                        } catch (err) {
                          console.error("Approval failed:", err);
                          setTxStatus('error');
                        } finally {
                          setIsApprovingManually(false);
                          setIsVerifyingApproval(false);
                        }
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                      disabled={isApproving || isApprovingManually || isVerifyingApproval}
                    >
                      {isApproving || isApprovingManually 
                        ? "Approving USDC..." 
                        : isVerifyingApproval 
                          ? "Verifying Approval..." 
                          : "Approve USDC (One-Time)"}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Betting Interface */}
              <div className={isConnected && hasApproval ? "" : "opacity-75"}>
                {/* Approval status indicator */}
                {typeof window !== 'undefined' && isConnected && hasApproval && (
                  <div className="mb-4">
                    <span className="bg-green-900 text-green-300 text-xs font-semibold px-2 py-1 rounded-full border border-green-700">
                      ✅ USDC Approved
                    </span>
                  </div>
                )}
                
                <div className="flex items-center mb-4">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => {
                      setBetAmount(e.target.value);
                      // Automatically show trade preview when amount is entered
                      if (parseFloat(e.target.value) > 0) {
                        setShowTradePreview(true);
                      }
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-l-lg p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount in USDC"
                  />
                  <span className="bg-gray-600 p-2 rounded-r-lg">USDC</span>
                </div>
                
                {/* Quick Bet Amounts */}
                <div className="flex space-x-2 mb-4">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setBetAmount(amount.toString());
                        setShowTradePreview(true);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-md flex-1 transition-colors"
                    >
                      {amount} USDC
                    </button>
                  ))}
                </div>
                
                {/* Bet Preview */}
                {showTradePreview && betAmount && parseFloat(betAmount) > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Trade Preview</h3>
                      <div className="flex space-x-2">
                        <button 
                          className={`px-2 py-1 text-xs rounded-md ${previewSide === 'YES' ? 'bg-green-700 text-white' : 'bg-gray-600 text-gray-300'}`}
                          onClick={() => setPreviewSide('YES')}
                        >
                          YES
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded-md ${previewSide === 'NO' ? 'bg-red-700 text-white' : 'bg-gray-600 text-gray-300'}`}
                          onClick={() => setPreviewSide('NO')}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bet Amount:</span>
                        <span>{betAmount} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Side:</span>
                        <span className={previewSide === 'YES' ? 'text-green-400' : 'text-red-400'}>
                          {previewSide}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Probability:</span>
                        <span>{formatProbability(probability || 50)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price Impact:</span>
                        <span className={calculatePriceImpact(betAmount, previewSide === 'YES') > 0 ? 'text-green-400' : 'text-red-400'}>
                          {calculatePriceImpact(betAmount, previewSide === 'YES').toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">New Probability:</span>
                        <span>
                          {previewSide === 'YES' 
                            ? formatProbability((probability || 50) + calculatePriceImpact(betAmount, true))
                            : formatProbability((probability || 50) - calculatePriceImpact(betAmount, false))}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-gray-600 pt-2 mt-2">
                        <span className="text-gray-400">Potential Return:</span>
                        <span className={previewSide === 'YES' ? 'text-green-400' : 'text-red-400'}>
                          {calculateExpectedPayout(betAmount, previewSide === 'YES').toFixed(2)} USDC
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Bet Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setPreviewSide('YES');
                      handleBetYes();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-lg font-bold transition-colors"
                    disabled={!isConnected || isApproving || !hasApproval || txStatus === 'pending'}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">BUY YES</span>
                      <span className="text-xs">
                        Price: {formatProbability(probability || 50)}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setPreviewSide('NO');
                      handleBetNo();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-lg font-bold transition-colors"
                    disabled={!isConnected || isApproving || !hasApproval || txStatus === 'pending'}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">BUY NO</span>
                      <span className="text-xs">
                        Price: {formatProbability(100 - (probability || 50))}
                      </span>
                    </div>
                  </button>
                </div>
                
                {!isConnected && (
                  <div className="mt-4 text-center text-gray-400 text-sm">
                    Connect your wallet to place bets
                  </div>
                )}
                
                {/* Market Mechanism Explanation */}
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-lg text-white mb-2">How This Prediction Market Works:</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• Bet on <span className="text-green-400 font-bold">YES</span> or <span className="text-red-400 font-bold">NO</span> outcomes</p>
                    <p>• If outcome is true, YES bettors win all funds</p>
                    <p>• If outcome is false, NO bettors win all funds</p>
                    <p>• The current probability shows market sentiment</p>
                    <p>• When you bet, you move the probability in that direction</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Resolved market - show redemption interface
            <>
              <div className={`p-6 rounded-lg border ${finalOutcome ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium text-lg text-white">Market Resolved: {finalOutcome ? 'YES' : 'NO'}</h3>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-md mb-3">
                  <p className="text-sm text-gray-300">
                    This market has been resolved to <span className="font-bold">{finalOutcome ? 'YES' : 'NO'}</span>. 
                    If you bet on the winning outcome, you can now redeem your winnings.
                  </p>
                </div>
                
                <button
                  onClick={handleRedeem}
                  className={`w-full py-4 ${finalOutcome ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                  disabled={!isConnected || txStatus === 'pending'}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">REDEEM WINNINGS</span>
                    <span className="text-xs">Claim your USDC</span>
                  </div>
                </button>
                
                <div className="text-sm text-gray-300 mt-3">
                  <p className="mb-2"><strong>How Redemption Works:</strong></p>
                  <div className="text-xs text-gray-300 space-y-1">
                    <p>• Only bettors who chose {finalOutcome ? 'YES' : 'NO'} can redeem</p>
                    <p>• Winners receive their original bet plus a share of the losing pool</p>
                    <p>• Larger bets receive proportionally larger payouts</p>
                    <p>• Redemption is irreversible</p>
                  </div>
                </div>
              </div>
              
              {!isConnected && (
                <div className="mt-4 text-center text-gray-400 text-sm">
                  Connect your wallet to redeem winnings
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function calculateTimeRemaining(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "Ended";
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

export default MarketPage;