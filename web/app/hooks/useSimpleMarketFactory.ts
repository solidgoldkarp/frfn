'use client';

import { useContractRead, useContractWrite, useAccount, useWaitForTransaction, usePublicClient } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { simpleBookieFactoryAbi } from '../contracts/simpleBookie';
import { readContract } from 'wagmi/actions';
import { erc20Abi } from '../contracts/abis/erc20Abi';
import { parseUnits } from 'ethers/lib/utils';

const USDC_DECIMALS = 6;
const DEFAULT_COLLATERAL = '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea';

export const useSimpleMarketFactory = (factoryAddress: `0x${string}` | undefined) => {
  const [markets, setMarkets] = useState<`0x${string}`[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();
  
  // Get market count
  const { data: marketCount, refetch: refetchMarketCount } = useContractRead({
    address: factoryAddress,
    abi: simpleBookieFactoryAbi,
    functionName: 'getMarketCount',
    enabled: !!factoryAddress,
    watch: true,
  });
  
  // Get collateral token
  const { data: collateralToken } = useContractRead({
    address: factoryAddress,
    abi: simpleBookieFactoryAbi,
    functionName: 'collateralToken',
    enabled: !!factoryAddress,
  });
  
  // Create market
  const { writeAsync: createMarket, data: createData } = useContractWrite({
    address: factoryAddress,
    abi: simpleBookieFactoryAbi,
    functionName: 'createMarket',
  });
  
  // Track transaction
  const { isLoading: isCreatePending, isSuccess: isCreateSuccess } = useWaitForTransaction({
    hash: createData?.hash,
  });
  
  // Update loading state
  useEffect(() => {
    setIsLoading(isCreatePending);
  }, [isCreatePending]);
  
  // Fetch all markets
  useEffect(() => {
    const fetchMarkets = async () => {
      if (!factoryAddress || !marketCount) return;
      
      const marketAddresses: `0x${string}`[] = [];
      const count = Number(marketCount);
      
      for (let i = 0; i < count; i++) {
        try {
          const market = await readContract({
            address: factoryAddress,
            abi: simpleBookieFactoryAbi,
            functionName: 'getMarket',
            args: [BigInt(i)],
          });
          
          if (market) {
            marketAddresses.push(market as `0x${string}`);
          }
        } catch (error) {
          console.error(`Error fetching market at index ${i}:`, error);
        }
      }
      
      setMarkets(marketAddresses);
    };
    
    fetchMarkets();
  }, [factoryAddress, marketCount]);
  
  // Refetch markets when new one is created
  useEffect(() => {
    if (isCreateSuccess) {
      refetchMarketCount();
    }
  }, [isCreateSuccess, refetchMarketCount]);
  
  // Remove the incorrect bet function - this should be in useSimpleMarket, not in the factory hook
  // The factory should only handle creating markets, not betting
  
  // Helper function to create a new market
  const createNewMarket = useCallback(async (question: string, resolutionTime: number) => {
    try {
      return await createMarket({
        args: [question, BigInt(resolutionTime)],
      });
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }, [createMarket]);
  
  return {
    markets,
    marketCount: marketCount ? Number(marketCount) : 0,
    collateralToken: collateralToken as `0x${string}` | undefined,
    createNewMarket,
    isLoading,
    refetchMarkets: refetchMarketCount,
  };
};