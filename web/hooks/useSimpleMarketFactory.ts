'use client';

import { useState, useCallback } from 'react';

export const useSimpleMarketFactory = (factoryAddress?: string) => {
  const [markets, setMarkets] = useState<string[]>([
    '0x27497b50aF8f400f8457243FD2775fE71eec5825',
    '0x1EA7c3396F48A7aCee1a9d1B4eE5C86B8bFF0D7e'
  ]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Simulated market creation
  const createMarket = useCallback(async (question: string, resolutionTime: number) => {
    setIsCreating(true);
    console.log(`Creating market with question: ${question}, resolution time: ${resolutionTime}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate a new market being added
    setMarkets(prev => [...prev, `0x${Math.random().toString(16).substring(2, 42)}`]);
    
    setIsCreating(false);
    return { hash: `0x${Math.random().toString(16).substring(2, 42)}` };
  }, []);
  
  return {
    markets,
    marketCount: markets.length,
    createMarket,
    isCreating,
    refetchMarkets: () => {
      console.log('Refetching markets...');
    }
  };
};