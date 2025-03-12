'use client';

import React from 'react';
import { useSimpleMarketFactory } from '../hooks/useSimpleMarketFactory';
import { simpleBookie } from '../contracts/simpleBookie';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import SimpleMarketCard from '../components/SimpleMarketCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import PageContainer from '../components/layout/PageContainer';
import StatusIndicator from '../components/ui/StatusIndicator';

export default function MarketsPage() {
  const { isConnected } = useAccount();
  const { markets, marketCount, isLoading: isFactoryLoading } = useSimpleMarketFactory(
    simpleBookie.monadTestnet.factory as `0x${string}`
  );
  
  return (
    <PageContainer>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F900BF] mb-2">
            Prediction Markets
          </h1>
          <p className="text-white/70 text-sm">
            Explore and trade on outcomes with dynamic liquidity concentration
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <StatusIndicator status="active" label="Markets Active" />
          {!isConnected && (
            <div className="backdrop-panel p-1 mt-2 md:mt-0">
              <ConnectButton />
            </div>
          )}
        </div>
      </div>

      {isFactoryLoading ? (
        <div className="backdrop-panel p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 mb-4 rounded-full bg-white/10"></div>
            <p className="text-white/70">Loading prediction markets...</p>
          </div>
        </div>
      ) : markets && markets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((marketAddress) => (
            <Link 
              href={`/simple-markets/${marketAddress}`} 
              key={marketAddress}
              className="transition-transform duration-300 hover:scale-[1.02]"
            >
              <SimpleMarketCard marketAddress={marketAddress} key={marketAddress} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="backdrop-panel p-8 text-center">
          <p className="text-white/70 mb-4">No prediction markets found</p>
          <Link href="/create" passHref>
            <Button variant="primary" glowing>Create a Market</Button>
          </Link>
        </div>
      )}
      
      <div className="mt-8 backdrop-panel p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs">Active Markets</span>
              <span className="text-white text-sm font-medium">{marketCount || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-xs">Protocol</span>
              <span className="text-white text-sm font-medium">pm-AMM v0.1</span>
            </div>
          </div>
          
          <Link href="/create" passHref>
            <Button variant="primary" size="sm">+ New Market</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}