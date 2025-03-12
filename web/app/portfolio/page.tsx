'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import PageContainer from '../components/layout/PageContainer';
import StatusIndicator from '../components/ui/StatusIndicator';

const PortfolioPage: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="backdrop-panel p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#F900BF] mb-6">Your Portfolio</h1>
          <p className="text-white/70 mb-8">Connect your wallet to view your portfolio</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F900BF] mb-2">
            Your Portfolio
          </h1>
          <p className="text-white/70 text-sm">
            View and manage your prediction market positions
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <ConnectButton />
        </div>
      </div>

      {/* In development message */}
      <div className="backdrop-panel p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Portfolio Feature Coming Soon</h2>
        <p className="text-white/70">
          We're working on building the portfolio view to help you track all your positions,
          token balances, and trading history across prediction markets.
        </p>
        <div className="mt-4">
          <Link href="/markets">
            <Button variant="primary">
              Browse Markets
            </Button>
          </Link>
        </div>
      </div>

      {/* Future portfolio features list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-panel p-6">
          <h3 className="text-lg font-semibold mb-3">Coming Soon</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-center">
              <span className="mr-2 text-[#F900BF]">•</span>
              Token balances for all markets
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-[#F900BF]">•</span>
              Active liquidity positions
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-[#F900BF]">•</span>
              Trading history and analytics
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-[#F900BF]">•</span>
              Profit and loss tracking
            </li>
          </ul>
        </div>
        <div className="backdrop-panel p-6">
          <h3 className="text-lg font-semibold mb-3">Early Access</h3>
          <p className="text-white/70 mb-4">
            Want to be the first to try new features? Join our early access program.
          </p>
          <div className="mt-2">
            <Link href="https://forms.fillout.com/t/krT4jE24haus" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                Join Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 backdrop-panel p-4">
        <div className="flex items-center">
          <StatusIndicator status="pending" label="Portfolio Features" />
          <span className="ml-3 text-white/50 text-xs">In development</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioPage;