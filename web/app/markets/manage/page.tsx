'use client';

import React, { useState, useEffect } from 'react';
import { useSimpleMarket } from '../../hooks/useSimpleMarket';
import { useSimpleMarketFactory } from '../../hooks/useSimpleMarketFactory';
import { simpleBookie } from '../../contracts/simpleBookie';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { formatUnits } from 'viem';

// Helper function to format time
const formatTime = (timestamp: number | undefined): string => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString();
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
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

export default function ManageMarketsPage() {
  const { address } = useAccount();
  const { isConnected } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState<`0x${string}` | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Factory contract address
  const factoryAddress = simpleBookie.monadTestnet.factory as `0x${string}`;
  
  // Get list of markets from factory
  const { 
    markets, 
    marketCount,
    isLoading: isFactoryLoading 
  } = useSimpleMarketFactory(factoryAddress);
  
  // Get selected market data
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
    resolveYes,
    resolveNo,
    forceResolveYes,
    forceResolveNo,
    redeemWinnings,
    cancelMarket,
    getRefund,
    isLoading
  } = useSimpleMarket(selectedMarket);
  
  // Initialize with default market if available
  useEffect(() => {
    if (markets && markets.length > 0 && !selectedMarket) {
      setSelectedMarket(markets[0]);
    }
  }, [markets, selectedMarket]);
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);
  
  // Handle resolve market
  const handleResolveYes = async () => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      const tx = await resolveYes();
      setSuccessMessage("Market resolved as YES. Transaction submitted!");
    } catch (error) {
      console.error('Error resolving market as YES:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const handleResolveNo = async () => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      const tx = await resolveNo();
      setSuccessMessage("Market resolved as NO. Transaction submitted!");
    } catch (error) {
      console.error('Error resolving market as NO:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle redeem
  const handleRedeem = async () => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      const tx = await redeemWinnings();
      setSuccessMessage("Redemption transaction submitted!");
    } catch (error) {
      console.error('Error redeeming:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle cancel market
  const handleCancelMarket = async () => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      const tx = await cancelMarket();
      setSuccessMessage("Market cancellation transaction submitted!");
    } catch (error) {
      console.error('Error cancelling market:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle refund
  const handleRefund = async () => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      const tx = await getRefund();
      setSuccessMessage("Refund transaction submitted!");
    } catch (error) {
      console.error('Error getting refund:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle force resolve (for testing only - resolves regardless of time)
  const handleForceResolve = async (outcome: boolean) => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // Call the forceResolve function which bypasses the time check (only works for admin)
      if (outcome) {
        const tx = await forceResolveYes();
        setSuccessMessage("Market force-resolved as YES. Transaction submitted!");
      } else {
        const tx = await forceResolveNo();
        setSuccessMessage("Market force-resolved as NO. Transaction submitted!");
      }
    } catch (error) {
      console.error(`Error force-resolving market as ${outcome ? "YES" : "NO"}:`, error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Prediction Markets</h1>
          {/* Navigation */}
          <Link href="/markets" className="text-blue-400 hover:underline">
            ← Back to Markets
          </Link>
        </div>
        
        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-800 border border-green-600 text-green-200 rounded-lg">
            ✅ {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-800 border border-red-600 text-red-200 rounded-lg">
            ❌ {errorMessage}
          </div>
        )}
        
        {/* Market Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Select a Market ({marketCount || 0})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets && markets.map((market) => (
              <div 
                key={market}
                className={`p-4 rounded-lg border cursor-pointer transition-colors 
                           ${selectedMarket === market 
                              ? 'bg-blue-900 border-blue-500' 
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                onClick={() => setSelectedMarket(market)}
              >
                <div className="font-medium truncate">{market}</div>
              </div>
            ))}
            {(!markets || markets.length === 0) && !isFactoryLoading && (
              <div className="col-span-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-center">
                No markets found. Create your first market!
              </div>
            )}
            {isFactoryLoading && (
              <div className="col-span-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-center">
                Loading markets...
              </div>
            )}
          </div>
        </div>
        
        {/* Selected Market Details */}
        {selectedMarket && (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="p-5 border-b border-gray-700">
              <h2 className="text-xl font-bold mb-2">{question || "Loading market information..."}</h2>
              <div className="text-sm text-gray-400">
                Market Address: <span className="font-mono">{selectedMarket}</span>
              </div>
              <div className="text-sm text-gray-400">
                Resolves: {resolutionTime ? formatTime(resolutionTime) : "Loading..."}
                {resolutionTime && ` (${calculateTimeRemaining(resolutionTime)})`}
              </div>
              <div className="text-sm text-gray-400">
                Status: <span className={`font-bold ${isResolved ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isResolved ? `Resolved: ${finalOutcome ? 'YES' : 'NO'}` : 'Active'}
                </span>
              </div>
            </div>
            
            {/* Market Stats */}
            <div className="p-5 border-b border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Market Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Total YES Bets</div>
                  <div className="text-lg font-bold text-green-400">
                    {totalYes ? formatUnits(BigInt(totalYes), 6) : "0"} USDC
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Total NO Bets</div>
                  <div className="text-lg font-bold text-red-400">
                    {totalNo ? formatUnits(BigInt(totalNo), 6) : "0"} USDC
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg col-span-2">
                  <div className="text-sm text-gray-400">Current Probability</div>
                  <div className="text-lg font-bold">{(probability || 50).toFixed(1)}%</div>
                  {/* Probability Bar */}
                  <div className="w-full h-4 bg-gray-600 rounded-full overflow-hidden mt-2">
                    <div className="flex h-full">
                      <div 
                        className="bg-green-600 h-full"
                        style={{ width: `${probability || 50}%` }}
                      />
                      <div 
                        className="bg-red-600 h-full"
                        style={{ width: `${100 - (probability || 50)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Position */}
            {isConnected && (
              <div className="p-5 border-b border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Your Position</h3>
                <div className="grid grid-cols-2 gap-4">
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
              </div>
            )}
            
            {/* Admin Actions */}
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4">Market Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Resolution Actions */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Resolve Market</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Set the final outcome of this market. This can only be done by the market admin.
                    {resolutionTime && Number(resolutionTime) > Date.now() / 1000 && (
                      <span className="block mt-2 text-yellow-400">
                        ⚠️ Note: Resolution time hasn't been reached yet.
                      </span>
                    )}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleResolveYes}
                      disabled={isLoading || isResolved}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                    >
                      Resolve YES
                    </button>
                    <button
                      onClick={handleResolveNo}
                      disabled={isLoading || isResolved}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                    >
                      Resolve NO
                    </button>
                  </div>
                </div>
                
                {/* Cancel Action */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Cancel Market</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Prematurely close this market without declaring a winner. All participants can get refunds.
                    This can only be done by the market admin.
                  </p>
                  <button
                    onClick={handleCancelMarket}
                    disabled={isLoading || isResolved}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel Market
                  </button>
                </div>
              </div>
              
              {/* User Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Redeem Winnings */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Redeem Winnings</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    If you bet on the winning outcome, claim your winnings after market resolution.
                  </p>
                  <button
                    onClick={handleRedeem}
                    disabled={isLoading || !isResolved}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                  >
                    Redeem Winnings
                  </button>
                </div>
                
                {/* Get Refund */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Get Refund</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    If this market was cancelled, get a refund of your bets.
                  </p>
                  <button
                    onClick={handleRefund}
                    disabled={isLoading || !isResolved}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                  >
                    Get Refund
                  </button>
                </div>
              </div>
              
              {/* Testing Section (for testnet only) */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Testnet-Only Actions</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Force Resolution (Testing Only)</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    For testing purposes only. Try to resolve the market regardless of time constraints.
                    This may fail if you're not the market admin.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleForceResolve(true)}
                      disabled={isLoading || isResolved}
                      className="flex-1 bg-green-900 hover:bg-green-800 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                    >
                      Force YES
                    </button>
                    <button
                      onClick={() => handleForceResolve(false)}
                      disabled={isLoading || isResolved}
                      className="flex-1 bg-red-900 hover:bg-red-800 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                    >
                      Force NO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Not Connected Message */}
        {!isConnected && (
          <div className="bg-yellow-800 border border-yellow-700 rounded-lg p-4 text-yellow-200 mt-4">
            <p className="font-bold">⚠️ Wallet not connected</p>
            <p>Please connect your wallet to manage markets.</p>
          </div>
        )}
      </div>
    </div>
  );
}