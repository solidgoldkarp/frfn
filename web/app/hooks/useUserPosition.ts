'use client';

import { useQuery } from '@tanstack/react-query';
import { useContractRead } from 'wagmi';
import { predictionMarketAbi } from '../contracts/abis/predictionMarketAbi';
import { erc20Abi } from '../contracts/abis/erc20Abi';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { useState, useCallback } from 'react';

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
}

/**
 * Custom hook to fetch and calculate user position in a prediction market
 */
export const useUserPosition = (marketAddress: string, userAddress?: `0x${string}`) => {
  // Get market parameters to find token addresses
  const { data: marketParams } = useContractRead({
    address: marketAddress as `0x${string}`,
    abi: predictionMarketAbi,
    functionName: 'marketParams',
    enabled: !!marketAddress,
  });
  
  // Extract token addresses from market params
  const yesTokenAddress = marketParams ? (marketParams as any)[2] as `0x${string}` : undefined;
  const noTokenAddress = marketParams ? (marketParams as any)[3] as `0x${string}` : undefined;
  
  // Track last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  
  // Main query for user position data
  const positionQuery = useQuery(
    ['userPosition', marketAddress, userAddress],
    async () => {
      if (!userAddress || !yesTokenAddress || !noTokenAddress) {
        throw new Error('Missing required addresses');
      }
      
      const now = Date.now();
      console.log(`Fetching position data. Last refresh: ${(now - lastRefreshTime) / 1000}s ago`);
      
      // Check for rate limiting - prevent excessive calls
      if (now - lastRefreshTime < 30000) { // 30 seconds minimum between refreshes
        console.log(`Rate limited: Position data refresh too frequent. Wait ${Math.ceil((30000 - (now - lastRefreshTime))/1000)}s.`);
        
        // Return cached data from localStorage if available
        const cachedData = localStorage.getItem(`position-${marketAddress}-${userAddress}`);
        if (cachedData) {
          console.log("Using cached position data from localStorage");
          return JSON.parse(cachedData);
        }
        
        throw new Error('Rate limited - try again later');
      }
      
      setLastRefreshTime(now);
      
      try {
        // We need to make multiple concurrent contract reads
        const [yesBalanceResult, noBalanceResult, liquiditySharesResult, poolStateResult, totalSharesResult] = await Promise.all([
          // YES token balance
          fetchContractData({
            address: yesTokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
          }),
          
          // NO token balance
          fetchContractData({
            address: noTokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
          }),
          
          // Liquidity shares
          fetchContractData({
            address: marketAddress as `0x${string}`,
            abi: predictionMarketAbi,
            functionName: 'liquidityPositions',
            args: [userAddress],
          }),
          
          // Pool state for price calculation
          fetchContractData({
            address: marketAddress as `0x${string}`,
            abi: predictionMarketAbi,
            functionName: 'poolState',
          }),
          
          // Total liquidity shares
          fetchContractData({
            address: marketAddress as `0x${string}`,
            abi: predictionMarketAbi,
            functionName: 'totalLiquidityShares',
          }),
        ]);
        
        // Parse results
        const yesBalance = yesBalanceResult as BigNumber;
        const noBalance = noBalanceResult as BigNumber;
        const liquidityShares = liquiditySharesResult as BigNumber;
        const poolState = poolStateResult as any;
        const totalShares = totalSharesResult as BigNumber;
        
        // Get pool reserves
        const xReserve = poolState[0] as BigNumber;
        const yReserve = poolState[1] as BigNumber;
        
        // Calculate position data
        
        // Calculate share percentages
        const hasLiquidity = totalShares && !totalShares.isZero();
        const liquiditySharePercentage = hasLiquidity 
          ? liquidityShares.mul(100).div(totalShares)
          : BigNumber.from(0);
        
        // Calculate indirect holdings through liquidity
        const indirectYesHoldings = hasLiquidity 
          ? xReserve.mul(liquidityShares).div(totalShares)
          : BigNumber.from(0);
          
        const indirectNoHoldings = hasLiquidity
          ? yReserve.mul(liquidityShares).div(totalShares)
          : BigNumber.from(0);
        
        // Calculate total holdings
        const totalYesHoldings = yesBalance.add(indirectYesHoldings);
        const totalNoHoldings = noBalance.add(indirectNoHoldings);
        
        // Calculate market prices (simplified)
        const totalSupply = xReserve.add(yReserve);
        const yesPricePercent = !totalSupply.isZero() 
          ? yReserve.mul(100).div(totalSupply)
          : BigNumber.from(50); // Default to 50%
          
        const noPricePercent = BigNumber.from(100).sub(yesPricePercent);
        
        // Estimate value in USDC (simplified)
        const yesValueInUSDC = totalYesHoldings.mul(yesPricePercent).div(100);
        const noValueInUSDC = totalNoHoldings.mul(noPricePercent).div(100);
        const totalValueInUSDC = yesValueInUSDC.add(noValueInUSDC);
        
        // Format position data
        const position: PositionData = {
          balances: {
            yes: formatEther(yesBalance),
            no: formatEther(noBalance),
            liquidity: formatEther(liquidityShares),
          },
          positions: {
            yes: {
              valueInUSDC: formatEther(yesValueInUSDC),
              percent: yesPricePercent.toNumber(),
            },
            no: {
              valueInUSDC: formatEther(noValueInUSDC),
              percent: noPricePercent.toNumber(),
            },
            total: {
              valueInUSDC: formatEther(totalValueInUSDC),
            },
          },
        };
        
        // Cache the data in localStorage
        localStorage.setItem(`position-${marketAddress}-${userAddress}`, JSON.stringify(position));
        
        return position;
      } catch (error) {
        console.error("Error fetching position data:", error);
        
        // Try to return cached data if available
        const cachedData = localStorage.getItem(`position-${marketAddress}-${userAddress}`);
        if (cachedData) {
          console.log("Using cached position data after error");
          return JSON.parse(cachedData);
        }
        
        throw error;
      }
    },
    {
      enabled: !!userAddress && !!marketAddress && !!yesTokenAddress && !!noTokenAddress,
      staleTime: 3600000, // 1 hour
      gcTime: 3600000, // 1 hour
      refetchInterval: false // Disable automatic refetching
    }
  );
  
  // Add manual refresh function with rate limiting
  const refreshPosition = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime > 30000) { // 30 second cooldown 
      console.log("Manual position refresh triggered");
      positionQuery.refetch();
      return true;
    } else {
      console.log(`Position refresh blocked - please wait ${Math.ceil((30000 - (now - lastRefreshTime))/1000)} seconds`);
      return false;
    }
  }, [positionQuery, lastRefreshTime]);
  
  // Return query plus manual refresh function
  return {
    ...positionQuery,
    refreshPosition
  };
};

// Helper function to make contract calls
async function fetchContractData({ 
  address, 
  abi, 
  functionName, 
  args = [] 
}: { 
  address: `0x${string}`, 
  abi: any, 
  functionName: string, 
  args?: any[] 
}) {
  // This function would normally use publicClient.readContract in a more complete implementation
  // For now, we'll use a simplified version
  
  // Use a dummy implementation that returns a promise resolving to the data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Dummy implementation - in a real app, you'd use viem's readContract here
      // The real data would come from the contract call
      if (functionName === 'balanceOf') {
        resolve(BigNumber.from('1000000000000000000')); // 1 token
      } else if (functionName === 'liquidityPositions') {
        resolve(BigNumber.from('500000000000000000')); // 0.5 shares
      } else if (functionName === 'poolState') {
        resolve([
          BigNumber.from('10000000000000000000'), // 10 tokens in X reserve
          BigNumber.from('10000000000000000000'), // 10 tokens in Y reserve
          BigNumber.from('0'), // dummy values for other fields
          BigNumber.from('0'),
          BigNumber.from('0'),
          {
            xVirtual: BigNumber.from('20000000000000000000'),
            yVirtual: BigNumber.from('20000000000000000000'),
          },
        ]);
      } else if (functionName === 'totalLiquidityShares') {
        resolve(BigNumber.from('1000000000000000000')); // 1 total shares
      }
    }, 100);
  });
}