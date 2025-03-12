import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';

export const formatTimestamp = (timestamp: number | string | BigNumber): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export const formatProbability = (probability: number | string | BigNumber): string => {
  if (typeof probability === 'number') {
    return `${probability.toFixed(2)}%`;
  }
  
  if (typeof probability === 'string') {
    return `${parseFloat(probability).toFixed(2)}%`;
  }
  
  // Convert from WAD (1e18 = 100%)
  const formattedProb = parseFloat(formatEther(probability)) * 100;
  return `${formattedProb.toFixed(2)}%`;
};

export const formatWad = (wad: BigNumber, decimals = 2): string => {
  return parseFloat(formatEther(wad)).toFixed(decimals);
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
};

export const formatBalance = (
  balance: BigNumber | undefined,
  decimals = 4
): string => {
  if (!balance) return '0';
  return parseFloat(formatEther(balance)).toFixed(decimals);
};