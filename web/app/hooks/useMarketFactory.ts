'use client';

import { useContractRead, useContractWrite, useNetwork, usePublicClient } from 'wagmi';
import { getAddresses } from '../contracts/addresses';
import { marketFactoryAbi } from '../contracts/abis/marketFactoryAbi';
import { useCallback, useEffect, useState } from 'react';
import { parseEther } from 'ethers/lib/utils';

export const useMarketFactory = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 10143; // Default to Monad Testnet
  const addresses = getAddresses(chainId);
  const publicClient = usePublicClient();
  
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [marketAddresses, setMarketAddresses] = useState<string[]>([]);
  const [marketCount, setMarketCount] = useState<number>(0);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isLoadingMarketCount, setIsLoadingMarketCount] = useState(true);

  // Fetch markets from the contract
  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') return;
    
    const fetchMarkets = async () => {
      try {
        console.log("Fetching markets from blockchain...");
        
        // Get market count first
        const count = await publicClient.readContract({
          address: addresses.marketFactory as `0x${string}`,
          abi: marketFactoryAbi,
          functionName: 'getMarketCount',
        });
        
        const marketCountNumber = Number(count);
        setMarketCount(marketCountNumber);
        setIsLoadingMarketCount(false);
        
        console.log(`Found ${marketCountNumber} markets on the blockchain`);
        
        // Early return if no markets
        if (marketCountNumber === 0) {
          setMarketAddresses([]);
          setIsLoadingMarkets(false);
          return;
        }
        
        // Fetch all markets
        const markets: string[] = [];
        for (let i = 0; i < marketCountNumber; i++) {
          try {
            const marketAddress = await publicClient.readContract({
              address: addresses.marketFactory as `0x${string}`,
              abi: marketFactoryAbi,
              functionName: 'getMarket',
              args: [BigInt(i)],
            });
            
            if (marketAddress) {
              markets.push(marketAddress as string);
            }
          } catch (error) {
            console.error(`Error fetching market at index ${i}:`, error);
          }
        }
        
        // Save the fetched markets to state
        console.log(`Successfully fetched ${markets.length} markets:`, markets);
        setMarketAddresses(markets);
        
      } catch (error) {
        console.error("Error fetching markets:", error);
        setMarketAddresses([]);
      } finally {
        setIsLoadingMarkets(false);
      }
    };
    
    fetchMarkets();
  }, [addresses.marketFactory, publicClient]);
  
  // Create new market
  const { write: createMarket } = useContractWrite({
    address: addresses.marketFactory as `0x${string}`,
    abi: marketFactoryAbi,
    functionName: 'createMarket',
  });

  // Function to manually refresh markets
  const refetchMarketCount = useCallback(async () => {
    try {
      setIsLoadingMarketCount(true);
      setIsLoadingMarkets(true);
      
      // Get market count
      const count = await publicClient.readContract({
        address: addresses.marketFactory as `0x${string}`,
        abi: marketFactoryAbi,
        functionName: 'getMarketCount',
      });
      
      const marketCountNumber = Number(count);
      setMarketCount(marketCountNumber);
      setIsLoadingMarketCount(false);
      
      // Early return if no markets
      if (marketCountNumber === 0) {
        setMarketAddresses([]);
        setIsLoadingMarkets(false);
        return;
      }
      
      // Fetch all markets
      const markets: string[] = [];
      for (let i = 0; i < marketCountNumber; i++) {
        try {
          const marketAddress = await publicClient.readContract({
            address: addresses.marketFactory as `0x${string}`,
            abi: marketFactoryAbi,
            functionName: 'getMarket',
            args: [BigInt(i)],
          });
          
          if (marketAddress) {
            markets.push(marketAddress as string);
          }
        } catch (error) {
          console.error(`Error fetching market at index ${i}:`, error);
        }
      }
      
      // Update state
      setMarketAddresses(markets);
      
    } catch (error) {
      console.error("Error refreshing markets:", error);
    } finally {
      setIsLoadingMarkets(false);
    }
  }, [addresses.marketFactory, publicClient]);

  // Helper function to create a market
  const createNewMarket = useCallback(async (
    question: string,
    resolutionTime: number,
    initialProbability: number,
    collateralToken = addresses.testCollateral,
  ) => {
    try {
      setIsCreatingMarket(true);
      
      // Convert initialProbability (0-100) to WAD format (0-1e18)
      const probabilityStr = (initialProbability / 100).toString();
      const probability = BigInt(parseEther(probabilityStr).toString());
      
      console.log("Creating market with parameters:", {
        question,
        resolutionTime: new Date(resolutionTime * 1000).toLocaleString(),
        initialProbability: `${initialProbability}% (${probability.toString()} WAD)`,
        collateralToken
      });
      
      // Create market with simple args
      createMarket({
        args: [question, BigInt(resolutionTime), probability, collateralToken as `0x${string}`],
      });
      
      // Handle post-creation actions
      console.log("Market creation transaction submitted");
      
      // Wait 3 seconds and then finish creating
      setTimeout(() => {
        // Force refresh the markets list after creation
        refetchMarketCount();
        setIsCreatingMarket(false);
      }, 3000);
      
      return "Transaction submitted. Please refresh the page after a minute to see your new market.";
    } catch (error) {
      console.error('Error creating market:', error);
      setIsCreatingMarket(false);
      throw error;
    }
  }, [addresses.testCollateral, createMarket, refetchMarketCount]);
  
  // Get a market by its index
  const getMarketByIndex = useCallback((index: number): string | null => {
    if (index < 0 || index >= marketAddresses.length) return null;
    return marketAddresses[index];
  }, [marketAddresses]);

  return {
    // Data
    marketCount,
    marketAddresses,
    
    // Status
    isLoadingMarketCount,
    isLoadingMarkets,
    isCreatingMarket,
    
    // Actions
    getMarketByIndex,
    createNewMarket,
    refetchMarketCount
  };
};