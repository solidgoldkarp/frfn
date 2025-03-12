'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { formatProbability, formatTimestamp } from '../utils/format';
import { useMarket } from '../hooks/useMarket';

interface MarketCardProps {
  marketAddress: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ marketAddress }) => {
  // Special handling for Hook contract
  const isHookContract = marketAddress === '0x3fF7f148bbE9ccc203232BD8662F09fd5B15C888';
  
  // Use market hook for regular markets (with caching)
  const { 
    marketInfo, 
    isLoading,
    currentProbability
  } = useMarket(marketAddress as `0x${string}`);
  
  // Create special market info for the Hook contract
  const specialHookInfo = isHookContract ? {
    question: "Token Redemption Test Market",
    resolutionTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    resolved: false,
    outcome: 'YES' as const,
    creationTime: new Date(),
    fromCache: false
  } : null;
  
  // Use either the special hook info or the data from the hook
  const finalMarketInfo = isHookContract ? specialHookInfo : marketInfo;
  const finalProbability = isHookContract ? 50 : currentProbability;
  
  // Standard loading state
  if (!isHookContract && (isLoading || !finalMarketInfo)) {
    return (
      <div className="flex flex-col w-full p-6 bg-gray-800 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
        <div className="flex justify-between mt-4">
          <div className="h-10 bg-gray-600 rounded w-1/4"></div>
          <div className="h-10 bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // Build progress bar for probability, with safety checks
  const probability = typeof finalProbability === 'number' ? finalProbability : 50;
  // Ensure probability is between 0 and 100
  const clampedProbability = Math.max(0, Math.min(100, probability));
  const yesWidth = `${clampedProbability}%`;
  const noWidth = `${100 - clampedProbability}%`;

  // Determine market status and color
  const now = new Date();
  const resolutionTime = finalMarketInfo?.resolutionTime || new Date(Date.now() + 86400000); // Default to 1 day ahead if missing
  const isExpired = now > resolutionTime;
  const statusColor = finalMarketInfo?.resolved ? 'bg-gray-500' : (isExpired ? 'bg-red-500' : 'bg-green-500');
  
  return (
    <div className="flex flex-col w-full p-6 bg-gray-800 rounded-lg shadow-md text-white relative hover:bg-gray-700 transition-colors">
      {/* Status indicator with label */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <span className="text-xs font-medium">
          {finalMarketInfo?.resolved ? 'Resolved' : (isExpired ? 'Expired' : 'Active')}
        </span>
        <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
      </div>
      
      <h3 className="text-xl font-bold mb-3">
        {finalMarketInfo?.question || "Loading..."}
      </h3>
      
      {/* Expiry countdown */}
      <div className="flex flex-col space-y-1 mb-4">
        <div className="text-sm text-gray-300 flex justify-between">
          <span>Expires:</span>
          <span className="font-medium">
            {finalMarketInfo?.resolutionTime && 
             finalMarketInfo.resolutionTime instanceof Date && 
             !isNaN(finalMarketInfo.resolutionTime.getTime()) &&
             typeof finalMarketInfo.resolutionTime.toLocaleString === 'function' 
              ? finalMarketInfo.resolutionTime.toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) 
              : 'Date not available'}
          </span>
        </div>
        
        {finalMarketInfo?.resolved && finalMarketInfo.outcome && (
          <div className="text-sm flex justify-between">
            <span>Outcome:</span>
            <span className={`font-bold ${finalMarketInfo.outcome === 'YES' ? 'text-green-400' : 'text-red-400'}`}>
              {finalMarketInfo.outcome}
            </span>
          </div>
        )}
      </div>
      
      {/* Probability bar - improved design */}
      <div className="mt-2 mb-5">
        <div className="flex justify-between text-sm font-medium mb-1">
          <span className="text-green-400">YES: {probability.toFixed(1)}%</span>
          <span className="text-red-400">NO: {(100 - probability).toFixed(1)}%</span>
        </div>
        <div className="w-full h-5 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
          <div className="flex h-full">
            <div 
              className="bg-gradient-to-r from-green-700 to-green-500 h-full flex items-center justify-center text-xs font-bold" 
              style={{ width: yesWidth }}
            >
              {probability > 20 ? `${probability.toFixed(0)}%` : ''}
            </div>
            <div 
              className="bg-gradient-to-l from-red-700 to-red-500 h-full flex items-center justify-center text-xs font-bold" 
              style={{ width: noWidth }}
            >
              {(100 - probability) > 20 ? `${(100 - probability).toFixed(0)}%` : ''}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trade buttons */}
      <div className="flex flex-col gap-3 mt-auto">
        <div className="grid grid-cols-2 gap-2">
          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">
            Buy YES
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
            Buy NO
          </Button>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full"
          onClick={() => window.location.href = `/markets/${marketAddress}`}
        >
          View Market
        </Button>
      </div>
    </div>
  );
};

export default MarketCard;