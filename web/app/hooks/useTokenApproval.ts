'use client';

import { useCallback } from 'react';
import { useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import { parseUnits } from 'viem';
import { erc20Abi } from '../contracts/simpleBookie';

export const useTokenApproval = (
  tokenAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}` | undefined,
  userAddress: `0x${string}` | undefined,
  decimals: number = 6
) => {
  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, spenderAddress as `0x${string}`],
    enabled: !!tokenAddress && !!spenderAddress && !!userAddress,
    watch: true, // Watch for changes to allowance
  });

  // Approve token
  const { writeAsync: approve, data: approveData } = useContractWrite({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
  });

  // Wait for approval transaction
  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  // Check if token is approved for specified amount
  const isApproved = useCallback(
    (amount: string) => {
      if (!allowance) return false;
      return BigInt(allowance.toString()) >= parseUnits(amount, decimals);
    },
    [allowance, decimals]
  );

  // Approve token for specified amount or max value
  const approveToken = useCallback(
    async (amount?: string) => {
      if (!tokenAddress || !spenderAddress) return;
      
      try {
        // Use max uint256 value if no amount specified
        const approvalAmount = amount
          ? parseUnits(amount, decimals)
          : BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'); // Max uint256
        
        const tx = await approve({
          args: [spenderAddress, approvalAmount],
        });
        
        return tx;
      } catch (error) {
        console.error('Error approving token:', error);
        throw error;
      }
    },
    [approve, tokenAddress, spenderAddress, decimals]
  );

  return {
    allowance,
    isApproved,
    approveToken,
    isApproving,
    refetchAllowance,
  };
};