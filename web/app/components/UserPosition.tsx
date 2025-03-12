'use client';

import React from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatBalance } from '../utils/format';
import { useUserPosition } from '../hooks/useUserPosition';
import { erc20Abi } from '../contracts/abis/erc20Abi';
import { formatUnits } from 'ethers/lib/utils';

interface UserPositionProps {
  marketAddress: string;
  onRefresh?: () => void;
  refreshTrigger?: number; // Increment this to trigger refresh
}

interface PositionData {
  balances: {
    yes: string;
    no: string;
    liquidity: string;
  };
  positions: {
    yes: {
      valueInUSDC: string;
      percent: number;
    };
    no: {
      valueInUSDC: string;
      percent: number;
    };
    total: {
      valueInUSDC: string;
    };
  };
  isLoading: boolean;
}

const initialPosition: PositionData = {
  balances: {
    yes: "0",
    no: "0",
    liquidity: "0"
  },
  positions: {
    yes: {
      valueInUSDC: "0",
      percent: 0
    },
    no: {
      valueInUSDC: "0",
      percent: 0
    },
    total: {
      valueInUSDC: "0"
    }
  },
  isLoading: true
};

// USDC token address on Monad testnet
const USDC_ADDRESS = '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea';
const USDC_DECIMALS = 6;

export const UserPosition: React.FC<UserPositionProps> = ({ 
  marketAddress,
  onRefresh
}) => {
  const { address } = useAccount();
  
  // Use our new React Query-based hook for position data with manual refresh
  const { 
    data: positionData, 
    isLoading, 
    isError, 
    refreshPosition // Use our custom rate-limited refresh function
  } = useUserPosition(marketAddress, address as `0x${string}`);
  
  // Read USDC balance explicitly
  const { data: usdcBalance, isLoading: isLoadingUsdcBalance } = useContractRead({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: !!address,
    watch: true,
  });
  
  // Handle refresh button click with rate limiting
  const handleRefresh = () => {
    // Use our rate-limited refresh function
    const refreshSuccess = refreshPosition();
    
    if (refreshSuccess) {
      // Call parent refresh handler if provided
      if (onRefresh) onRefresh();
    } else {
      // If refresh was rate-limited, show a toast or message
      console.log("Position refresh blocked due to rate limiting");
    }
  };
  
  // If no wallet connected
  if (!address) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-gray-300 text-center">
        Connect your wallet to view your position
      </div>
    );
  }
  
  // Show loading state
  if (isLoading || !positionData) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-bold text-white mb-2">Your Position</h2>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-700 rounded mb-2"></div>
          <div className="h-5 bg-gray-700 rounded mb-2"></div>
          <div className="h-5 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (isError) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-bold text-white mb-2">Your Position</h2>
        <div className="text-red-400 text-sm">
          Error loading position data. 
          <button 
            onClick={handleRefresh}
            className="ml-2 underline text-blue-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  // Format the USDC balance
  const formattedUsdcBalance = usdcBalance 
    ? parseFloat(formatUnits(usdcBalance, USDC_DECIMALS)).toFixed(2) 
    : '0.00';

  // Display only market position without USDC balance
  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Your Market Position</h2>
        <button 
          onClick={handleRefresh}
          className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
          title="Refresh position data (30-second cooldown)"
        >
          Refresh Position
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* YES Position */}
        <div className="bg-green-900 p-3 rounded-md">
          <h3 className="text-sm text-green-400 font-medium mb-1">YES Tokens</h3>
          <p className="text-xl font-bold">{parseFloat(positionData.balances.yes).toFixed(4)}</p>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-300">Value:</span>
            <span>{parseFloat(positionData.positions.yes.valueInUSDC).toFixed(4)} USDC</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-300">Price:</span>
            <span>{positionData.positions.yes.percent}%</span>
          </div>
        </div>
        
        {/* NO Position */}
        <div className="bg-red-900 p-3 rounded-md">
          <h3 className="text-sm text-red-400 font-medium mb-1">NO Tokens</h3>
          <p className="text-xl font-bold">{parseFloat(positionData.balances.no).toFixed(4)}</p>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-300">Value:</span>
            <span>{parseFloat(positionData.positions.no.valueInUSDC).toFixed(4)} USDC</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-300">Price:</span>
            <span>{positionData.positions.no.percent}%</span>
          </div>
        </div>
        
        {/* Liquidity Position */}
        <div className="bg-blue-900 p-3 rounded-md">
          <h3 className="text-sm text-blue-400 font-medium mb-1">Liquidity Position</h3>
          <p className="text-xl font-bold">{parseFloat(positionData.balances.liquidity).toFixed(4)}</p>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-300">Contains:</span>
            <span>YES + NO tokens</span>
          </div>
        </div>
      </div>
      
      {/* Total Value */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h3 className="text-sm text-gray-300 mb-1">Total Position Value</h3>
        <p className="text-xl font-bold">{parseFloat(positionData.positions.total.valueInUSDC).toFixed(4)} USDC</p>
      </div>
    </div>
  );
};