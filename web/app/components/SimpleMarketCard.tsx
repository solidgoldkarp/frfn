'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { useSimpleMarket } from '../hooks/useSimpleMarket';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { useTokenApproval } from '../hooks/useTokenApproval';
import { simpleBookie } from '../contracts/simpleBookie';

interface SimpleMarketCardProps {
  marketAddress: `0x${string}`;
}

// Helper function to format probability
const formatProbability = (prob: number): string => {
  return `${prob.toFixed(1)}%`;
};

// Helper function to calculate time remaining until resolution
function calculateTimeRemaining(timestamp: number | undefined): string {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "Ended";
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else {
    return `${hours}h remaining`;
  }
}

const SimpleMarketCard: React.FC<SimpleMarketCardProps> = ({ marketAddress }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [isApprovingOrBetting, setIsApprovingOrBetting] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'betting' | 'success' | 'error' | 'approved'>('idle');

  // Default bet amount is 1 USDC
  const betAmount = '1';
  
  // Token address for approval
  const tokenAddress = simpleBookie.monadTestnet.usdc as `0x${string}`;
  
  // Use market hook to fetch data
  const { 
    question, 
    resolutionTime, 
    probability, 
    totalYes, 
    totalNo, 
    isResolved, 
    finalOutcome,
    placeBetYes,
    placeBetNo,
    isLoading
  } = useSimpleMarket(marketAddress);
  
  // Token approval
  const {
    isApproved,
    approveToken,
    isApproving,
    refetchAllowance,
    allowance
  } = useTokenApproval(tokenAddress, marketAddress, address, 6);
  
  // Loading state
  if (isLoading || !question) {
    return (
      <div className="flex flex-col w-full h-[400px] p-5 backdrop-panel animate-pulse">
        <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="flex justify-between mt-4">
          <div className="h-10 bg-white/10 rounded w-1/4"></div>
          <div className="h-10 bg-white/10 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // Build progress bar for probability, with safety checks
  const currentProbability = probability || 50;
  // Ensure probability is between 0 and 100
  const clampedProbability = Math.max(0, Math.min(100, currentProbability));
  const yesWidth = `${clampedProbability}%`;
  const noWidth = `${100 - clampedProbability}%`;

  // Determine market status and color
  const now = new Date();
  const resolutionDate = resolutionTime ? new Date(resolutionTime * 1000) : new Date(Date.now() + 86400000); // Default to 1 day ahead if missing
  const isExpired = now > resolutionDate;
  const statusColor = isResolved ? 'bg-gray-500' : (isExpired ? 'bg-red-500' : 'bg-green-500');
  
  return (
    <div className="flex flex-col w-full h-[400px] p-5 backdrop-panel text-white relative hover:bg-black/30 transition-colors">
      {/* Status indicator with label */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <span className="text-xs font-medium">
          {isResolved ? 'Resolved' : (isExpired ? 'Expired' : 'Active')}
        </span>
        <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 min-h-[3.5rem] line-clamp-3">{question}</h3>
      
      {/* Expiry countdown and Status - fixed height section */}
      <div className="flex flex-col space-y-1 mb-3 min-h-[50px]">
        <div className="text-sm text-white/70 flex justify-between">
          <span>Resolves:</span>
          <span className="font-medium">
            {resolutionTime 
              ? new Date(resolutionTime * 1000).toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})
              : 'Date not available'}
          </span>
        </div>
        
        {/* Always show the outcome row, but conditionally show the actual outcome */}
        <div className="text-sm flex justify-between">
          <span>Outcome:</span>
          {isResolved ? (
            <span className={`font-bold ${finalOutcome ? 'text-green-400' : 'text-red-400'}`}>
              {finalOutcome ? 'YES' : 'NO'}
            </span>
          ) : (
            <span className="text-white/50">Pending</span>
          )}
        </div>
      </div>
      
      {/* Probability bar - fixed height section */}
      <div className="mt-2 mb-3 min-h-[70px]">
        <div className="flex justify-between text-sm font-medium mb-1">
          <span className="text-green-400">YES: {formatProbability(currentProbability)}</span>
          <span className="text-red-400">NO: {formatProbability(100 - currentProbability)}</span>
        </div>
        <div className="w-full h-5 bg-black/30 rounded-full overflow-hidden border border-white/10">
          <div className="flex h-full">
            <div 
              className="bg-green-600 h-full flex items-center justify-center text-xs font-bold" 
              style={{ width: yesWidth }}
            >
              {currentProbability > 20 ? `${currentProbability.toFixed(0)}%` : ''}
            </div>
            <div 
              className="bg-red-600 h-full flex items-center justify-center text-xs font-bold" 
              style={{ width: noWidth }}
            >
              {(100 - currentProbability) > 20 ? `${(100 - currentProbability).toFixed(0)}%` : ''}
            </div>
          </div>
        </div>
      </div>
      
      {/* Total Liquidity */}
      <div className="mb-3">
        <div className="text-xs text-white/50">Total Pool Liquidity</div>
        <div className="text-sm font-semibold text-[#F900BF]">
          {totalYes && totalNo ? formatUnits(BigInt(totalYes) + BigInt(totalNo), 6) : "0"} USDC
        </div>
      </div>
      
      {/* Spacer to push buttons to bottom */}
      <div className="flex-grow"></div>
      
      {!isResolved ? (
        /* Quick betting buttons for active markets */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={async () => {
                if (!isConnected) return;
                setIsApprovingOrBetting(true);
                setTxStatus('betting');
                
                try {
                  // Check if approved
                  const hasApproval = isApproved(betAmount);
                  
                  if (!hasApproval) {
                    // Sneakily do approval first
                    setTxStatus('approving');
                    const approveTx = await approveToken();
                    if (approveTx?.hash) {
                      await publicClient.waitForTransactionReceipt({ hash: approveTx.hash });
                      await refetchAllowance();
                      
                      // After approval, set the state back but keep the button enabled
                      setTxStatus('approved');
                      // Set a timeout to auto-reset the status
                      setTimeout(() => {
                        if (txStatus === "approved") {
                          setTxStatus("idle");
                        }
                      }, 5000);
                      setIsApprovingOrBetting(false);
                      
                      // Return early - user needs to click again
                      return;
                    }
                  }
                  
                  // Now place the bet
                  setTxStatus('betting');
                  await placeBetYes(betAmount);
                  setTxStatus('success');
                  
                  // Reset after 1.5 seconds
                  setTimeout(() => {
                    setTxStatus('idle');
                  }, 1500);
                } catch (error) {
                  console.error('Error with bet/approval:', error);
                  setTxStatus('error');
                  
                  // Error state - let user dismiss manually via modal
                } finally {
                  setIsApprovingOrBetting(false);
                }
              }}
              variant="yes"
              isLoading={txStatus === 'approving' || txStatus === 'betting'}
              disabled={!isConnected || isApprovingOrBetting}
            >
              <span className="text-sm">Buy YES ($1)</span>
            </Button>
            
            <Button 
              onClick={async () => {
                if (!isConnected) return;
                setIsApprovingOrBetting(true);
                setTxStatus('betting');
                
                try {
                  // Check if approved
                  const hasApproval = isApproved(betAmount);
                  
                  if (!hasApproval) {
                    // Sneakily do approval first
                    setTxStatus('approving');
                    const approveTx = await approveToken();
                    // Set a timeout to auto-reset the status
                    setTimeout(() => {
                      if (txStatus === "approved") {
                        setTxStatus("idle");
                      }
                    }, 5000);
                    if (approveTx?.hash) {
                      await publicClient.waitForTransactionReceipt({ hash: approveTx.hash });
                      await refetchAllowance();
                      
                      // After approval, set the state back but keep the button enabled
                      setTxStatus('approved');
                      setIsApprovingOrBetting(false);
                      
                      // Return early - user needs to click again
                      return;
                    }
                  }
                  
                  // Now place the bet
                  setTxStatus('betting');
                  await placeBetNo(betAmount);
                  setTxStatus('success');
                  
                  // Reset after 1.5 seconds
                  setTimeout(() => {
                    setTxStatus('idle');
                  }, 1500);
                } catch (error) {
                  console.error('Error with bet/approval:', error);
                  setTxStatus('error');
                  
                  // Error state - let user dismiss manually via modal
                } finally {
                  setIsApprovingOrBetting(false);
                }
              }}
              variant="no"
              isLoading={txStatus === 'approving' || txStatus === 'betting'}
              disabled={!isConnected || isApprovingOrBetting}
            >
              <span className="text-sm">Buy NO ($1)</span>
            </Button>
          </div>
          
          {/* Status indicators as small dots */}
          {txStatus !== 'idle' && (
            <div className="flex justify-center space-x-1 h-2">
              {txStatus === 'approving' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>}
              {txStatus === 'approved' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
              {txStatus === 'betting' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>}
              {txStatus === 'success' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
              {txStatus === 'error' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
            </div>
          )}
          
          {/* Status modals (absolutely positioned) */}
          {txStatus === 'approving' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
              <div className="backdrop-panel p-4 max-w-[80%] border-yellow-500/50 border shadow-lg">
                <div className="text-center mb-2">
                  <div className="inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Approving USDC</h3>
                <p className="text-sm text-white/70 mb-3">
                  This is a one-time approval for this market.
                </p>
                <p className="text-xs text-yellow-300">
                  You'll need to click again to place your bet after approval.
                </p>
              </div>
            </div>
          )}
          
          {txStatus === 'approved' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
              <div className="backdrop-panel p-4 max-w-[80%] border-green-500/50 border shadow-lg">
                <div className="text-center mb-2 text-green-500 text-2xl">✓</div>
                <h3 className="text-lg font-bold text-white mb-2">USDC Approved!</h3>
                <p className="text-sm text-white/70 mb-3">
                  You can now place your bet.
                </p>
                <button 
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                  onClick={() => setTxStatus('idle')}
                >
                  Got it
                </button>
              </div>
            </div>
          )}
          
          {txStatus === 'betting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
              <div className="backdrop-panel p-4 max-w-[80%] border-yellow-500/50 border shadow-lg">
                <div className="text-center mb-2">
                  <div className="inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-white">Placing Bet</h3>
                <p className="text-sm text-white/70">
                  Please wait while your transaction is processed.
                </p>
              </div>
            </div>
          )}
          
          {txStatus === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
              <div className="backdrop-panel p-4 max-w-[80%] border-green-500/50 border shadow-lg">
                <div className="text-center mb-2 text-green-500 text-2xl">✓</div>
                <h3 className="text-lg font-bold text-white">Success!</h3>
                <p className="text-sm text-white/70">
                  Your bet has been placed successfully.
                </p>
              </div>
            </div>
          )}
          
          {txStatus === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
              <div className="backdrop-panel p-4 max-w-[80%] border-red-500/50 border shadow-lg">
                <div className="text-center mb-2 text-red-500 text-2xl">✗</div>
                <h3 className="text-lg font-bold text-white">Transaction Failed</h3>
                <p className="text-sm text-white/70">
                  Please try again or check your wallet for details.
                </p>
                <button 
                  className="w-full mt-3 py-2 bg-black/30 hover:bg-black/50 text-white rounded-md text-sm font-medium"
                  onClick={() => setTxStatus('idle')}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {/* Link to market details */}
          <Link href={`/markets/${marketAddress}`} className="block">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      ) : (
        /* For resolved markets, just show the View Details button */
        <div>
          <Link href={`/markets/${marketAddress}`} className="block">
            <Button variant="primary" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimpleMarketCard;