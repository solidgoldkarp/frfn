'use client';

import { useContractRead, useContractWrite, useAccount, usePublicClient, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useState, useEffect, useCallback } from 'react';
import { simpleBookieMarketAbi } from '../contracts/simpleBookie';

export const useSimpleMarket = (marketAddress: `0x${string}` | undefined) => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  
  // Market information
  const { data: question } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'question',
    enabled: !!marketAddress,
  });
  
  const { data: resolutionTime } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'resolutionTime',
    enabled: !!marketAddress,
  });
  
  const { data: totalYes } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'totalYes',
    enabled: !!marketAddress,
    watch: true,
  });
  
  const { data: totalNo } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'totalNo',
    enabled: !!marketAddress,
    watch: true,
  });
  
  const { data: probability } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'currentProbability',
    enabled: !!marketAddress,
    watch: true,
  });
  
  const { data: isResolved } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'resolved',
    enabled: !!marketAddress,
    watch: true,
  });
  
  const { data: finalOutcome } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'outcome',
    enabled: !!marketAddress && !!isResolved,
    watch: true,
  });

  const { data: userYesBets } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'yesBets',
    args: [address as `0x${string}`],
    enabled: !!marketAddress && !!address,
    watch: true,
  });
  
  const { data: userNoBets } = useContractRead({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'noBets',
    args: [address as `0x${string}`],
    enabled: !!marketAddress && !!address,
    watch: true,
  });
  
  // Write functions
  const { writeAsync: betYes, data: betYesData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'bet',
  });
  
  const { writeAsync: betNo, data: betNoData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'bet',
  });
  
  const { writeAsync: resolveMarket, data: resolveData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'resolve',
  });
  
  const { writeAsync: redeemWinnings, data: redeemData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'redeem',
  });
  
  const { writeAsync: cancelMarket, data: cancelData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'cancelMarket',
  });
  
  const { writeAsync: getRefund, data: refundData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'refund',
  });
  
  const { writeAsync: forceResolveMarket, data: forceResolveData } = useContractWrite({
    address: marketAddress,
    abi: simpleBookieMarketAbi,
    functionName: 'forceResolve',
  });
  
  // Track transactions
  const { isLoading: isBetYesPending } = useWaitForTransaction({
    hash: betYesData?.hash,
  });
  
  const { isLoading: isBetNoPending } = useWaitForTransaction({
    hash: betNoData?.hash,
  });
  
  const { isLoading: isResolvePending } = useWaitForTransaction({
    hash: resolveData?.hash,
  });
  
  const { isLoading: isRedeemPending } = useWaitForTransaction({
    hash: redeemData?.hash,
  });
  
  const { isLoading: isCancelPending } = useWaitForTransaction({
    hash: cancelData?.hash,
  });
  
  const { isLoading: isRefundPending } = useWaitForTransaction({
    hash: refundData?.hash,
  });
  
  const { isLoading: isForceResolvePending } = useWaitForTransaction({
    hash: forceResolveData?.hash,
  });
  
  useEffect(() => {
    setIsLoading(
      isBetYesPending || 
      isBetNoPending || 
      isResolvePending || 
      isRedeemPending || 
      isCancelPending || 
      isRefundPending || 
      isForceResolvePending
    );
  }, [
    isBetYesPending, 
    isBetNoPending, 
    isResolvePending, 
    isRedeemPending, 
    isCancelPending, 
    isRefundPending,
    isForceResolvePending
  ]);
  
  // Helper functions
  const placeBetYes = useCallback(async (amount: string, decimals: number = 6) => {
    try {
      const amountBN = parseUnits(amount, decimals);
      return await betYes({
        args: [true, amountBN],
      });
    } catch (error) {
      console.error('Error placing YES bet:', error);
      throw error;
    }
  }, [betYes]);
  
  const placeBetNo = useCallback(async (amount: string, decimals: number = 6) => {
    try {
      const amountBN = parseUnits(amount, decimals);
      return await betNo({
        args: [false, amountBN],
      });
    } catch (error) {
      console.error('Error placing NO bet:', error);
      throw error;
    }
  }, [betNo]);
  
  const resolveYes = useCallback(async () => {
    try {
      return await resolveMarket({
        args: [true],
      });
    } catch (error) {
      console.error('Error resolving market as YES:', error);
      throw error;
    }
  }, [resolveMarket]);
  
  const resolveNo = useCallback(async () => {
    try {
      return await resolveMarket({
        args: [false],
      });
    } catch (error) {
      console.error('Error resolving market as NO:', error);
      throw error;
    }
  }, [resolveMarket]);
  
  const forceResolveYes = useCallback(async () => {
    try {
      return await forceResolveMarket({
        args: [true],
      });
    } catch (error) {
      console.error('Error force-resolving market as YES:', error);
      throw error;
    }
  }, [forceResolveMarket]);
  
  const forceResolveNo = useCallback(async () => {
    try {
      return await forceResolveMarket({
        args: [false],
      });
    } catch (error) {
      console.error('Error force-resolving market as NO:', error);
      throw error;
    }
  }, [forceResolveMarket]);
  
  // Format probability from WAD (1e18) to percentage
  const formattedProbability = probability ? Number(formatUnits(probability as bigint, 18)) * 100 : 50;
  
  return {
    // Market info
    question: question as string | undefined,
    resolutionTime: resolutionTime ? Number(resolutionTime) : undefined,
    totalYes: totalYes ? totalYes.toString() : '0',
    totalNo: totalNo ? totalNo.toString() : '0',
    probability: formattedProbability,
    isResolved: isResolved || false,
    finalOutcome: finalOutcome,
    
    // User info
    userYesBets: userYesBets ? userYesBets.toString() : '0',
    userNoBets: userNoBets ? userNoBets.toString() : '0',
    
    // Actions
    placeBetYes,
    placeBetNo,
    resolveYes,
    resolveNo,
    redeemWinnings,
    cancelMarket,
    getRefund,
    forceResolveYes,
    forceResolveNo,
    
    // Loading state
    isLoading,
  };
};