'use client';

import { useContractRead, useContractWrite, useAccount, usePublicClient } from 'wagmi';
import { predictionMarketAbi } from '../contracts/abis/predictionMarketAbi';
import { erc20Abi } from '../contracts/abis/erc20Abi';
import { useCallback, useEffect, useState } from 'react';
import { parseUnits, formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

const USDC_DECIMALS = 6;
const DEFAULT_COLLATERAL = '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea';

interface MarketInfo {
  question: string;
  resolutionTime: Date;
  resolved: boolean;
  outcome: 'YES' | 'NO';
  creationTime: Date;
}

export const useMarket = (marketAddress: `0x${string}`) => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProbability, setCurrentProbability] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<'none' | 'pending' | 'success' | 'error'>('none');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [poolState, setPoolState] = useState<any>(null);

  const { data: usdcBalance } = useContractRead({
    address: DEFAULT_COLLATERAL,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress!],
    enabled: !!userAddress,
  });

  const { writeAsync: approveUSDC } = useContractWrite({
    address: DEFAULT_COLLATERAL,
    abi: erc20Abi,
    functionName: 'approve',
  });

  const { writeAsync: mintTokens } = useContractWrite({
    address: marketAddress,
    abi: predictionMarketAbi,
    functionName: 'mintTokens',
  });
  
  const { writeAsync: swap } = useContractWrite({
    address: marketAddress,
    abi: predictionMarketAbi,
    functionName: 'swap',
  });
  
  const { writeAsync: redeemTokensWrite } = useContractWrite({
    address: marketAddress,
    abi: predictionMarketAbi,
    functionName: 'redeemTokens',
  });

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [question, resolutionTime, /* endTime */ _, resolved, outcome, probability] = await publicClient.readContract({
        address: marketAddress,
        abi: predictionMarketAbi,
        functionName: 'getMarketInfo',
      }) as [string, bigint, bigint, boolean, boolean, bigint];

      console.log('Question:', question);
      console.log('Resolution Time:', resolutionTime);
      // console.log('End Time:', endTime);
      console.log('Resolved:', resolved);
      console.log('Outcome:', outcome);
      console.log('Probability:', probability);

      setMarketInfo({
        question,
        resolutionTime: new Date(Number(resolutionTime) * 1000),
        resolved,
        outcome: outcome ? 'YES' : 'NO',
        creationTime: new Date(Number(_) * 1000),
      });

      setCurrentProbability(Number(formatUnits(probability, 18)) * 100);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [marketAddress, publicClient]);

  // Fetch pool state
  const fetchPoolState = useCallback(async () => {
    try {
      const poolStateData = await publicClient.readContract({
        address: marketAddress,
        abi: predictionMarketAbi,
        functionName: 'poolState',
      }) as [bigint, bigint, bigint] | undefined;
      
      // Format the pool state to match expected structure with BigNumber
      if (poolStateData) {
        const formattedPoolState = {
          x: BigNumber.from(poolStateData[0].toString()),
          y: BigNumber.from(poolStateData[1].toString()),
          l: BigNumber.from(poolStateData[2].toString()),
          virtualReserves: {
            xVirtual: BigNumber.from('0'),
            yVirtual: BigNumber.from('0')
          }
        };
        
        setPoolState(formattedPoolState);
        console.log("Pool state updated:", formattedPoolState);
      }
    } catch (error) {
      console.error('Error fetching pool state:', error);
    }
  }, [marketAddress, publicClient]);

  useEffect(() => {
    fetchMarketData();
    fetchPoolState();
  }, [fetchMarketData, fetchPoolState]);

  const buyTokens = useCallback(async (amount: string = "1") => {
    const parsedAmount = parseUnits(amount, USDC_DECIMALS);
    const parsedAmountBigInt = BigInt(parsedAmount.toString());

    if (!usdcBalance || parsedAmountBigInt > usdcBalance) {
      throw new Error("Insufficient USDC balance");
    }

    await approveUSDC({
      args: [marketAddress, parsedAmountBigInt],
      gas: BigInt(200000),
      maxFeePerGas: BigInt(2000000000),
      maxPriorityFeePerGas: BigInt(1000000000),
    });

    const txResult = await mintTokens({
      args: [parsedAmountBigInt],
      gas: BigInt(3000000),
      maxFeePerGas: BigInt(2000000000),
      maxPriorityFeePerGas: BigInt(1000000000),
    });

    await publicClient.waitForTransactionReceipt({ hash: txResult.hash });

    await fetchMarketData();
  }, [approveUSDC, mintTokens, usdcBalance, marketAddress, publicClient, fetchMarketData]);
  
  // Add swapTokens function
  const swapTokens = useCallback(async (isExactYes: boolean, amount: string = "1") => {
    try {
      setIsSubmitting(true);
      setTxStatus('pending');
      
      const parsedAmount = parseUnits(amount, USDC_DECIMALS);
      const parsedAmountBigInt = BigInt(parsedAmount.toString());
      
      // In our contract, swap takes:
      // - yesToNo: boolean (if true, swap YES for NO; if false, swap NO for YES)
      // - amountIn: BigInt (amount to swap)
      
      console.log("Swapping tokens:", isExactYes ? "YES -> NO" : "NO -> YES", "Amount:", amount);
      
      // First approve the market to spend tokens if necessary
      // This step may vary depending on your implementation
      
      // Then execute the swap - note that we only pass 2 parameters as per the ABI
      const txResult = await swap({
        args: [isExactYes, parsedAmountBigInt],
        gas: BigInt(3000000), 
        maxFeePerGas: BigInt(2000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
      });
      
      setTxHash(txResult.hash);
      
      await publicClient.waitForTransactionReceipt({ hash: txResult.hash });
      
      // Refresh market data
      await fetchMarketData();
      await fetchPoolState();
      
      setTxStatus('success');
      return true;
    } catch (error) {
      console.error("Error swapping tokens:", error);
      setTxStatus('error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [swap, marketAddress, publicClient, fetchMarketData, fetchPoolState]);
  
  // Add redeemTokens function
  const redeemTokens = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setTxStatus('pending');
      
      const txResult = await redeemTokensWrite({
        gas: BigInt(3000000),
        maxFeePerGas: BigInt(2000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
      });
      
      setTxHash(txResult.hash);
      
      await publicClient.waitForTransactionReceipt({ hash: txResult.hash });
      await fetchMarketData();
      await fetchPoolState();
      
      setTxStatus('success');
      return true;
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      setTxStatus('error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [redeemTokensWrite, publicClient, fetchMarketData, fetchPoolState]);
  
  // Placeholder comment to maintain code structure
  
  // Placeholders for admin functions
  const submitDecriptionShare = useCallback(async (share: string) => {
    console.log("Submitting decryption share:", share);
    return true;
  }, []);
  
  const chooseWinner = useCallback(async (outcome: boolean) => {
    console.log("Setting winner to:", outcome ? "YES" : "NO");
    return true;
  }, []);
  
  const manuallyFinalizeMarket = useCallback(async (finalized: boolean, winner: string) => {
    console.log("Manually finalizing market:", finalized, winner);
    return true;
  }, []);

  return {
    marketInfo,
    currentProbability,
    isLoading,
    buyTokens,
    mintTokens: buyTokens, // Alias for compatibility
    swapTokens,
    redeemTokens,
    usdcBalance: usdcBalance ? formatUnits(usdcBalance, USDC_DECIMALS) : "0",
    refetch: fetchMarketData,
    poolState,
    isSubmitting,
    txStatus,
    txHash,
    // Market finalization info
    isMarketFinalized: marketInfo?.resolved || false,
    marketWinner: marketInfo?.outcome || null,
    // Admin functions
    submitDecriptionShare,
    chooseWinner,
    manuallyFinalizeMarket,
    isHookTestMarket: marketAddress === '0x3fF7f148bbE9ccc203232BD8662F09fd5B15C888'
  };
};