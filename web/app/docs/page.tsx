'use client';

import React from 'react';
import Link from 'next/link';
import PageContainer from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import StatusIndicator from '../components/ui/StatusIndicator';

export default function DocsPage() {
  return (
    <PageContainer>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F900BF] mb-2">
            Documentation
          </h1>
          <p className="text-white/70 text-sm">
            Learn how frfn prediction markets work
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <StatusIndicator status="active" label="Monad Testnet" />
          <Link 
            href="https://www.paradigm.xyz/2024/11/pm-amm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#F900BF] hover:text-[#F900BF]/80 transition-colors text-sm"
          >
            Based on Paradigm's pm-AMM
          </Link>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="backdrop-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">What is frfn?</h2>
        <p className="text-white/90 mb-4">
        frfn is a permissionless prediction market solving liquidity fragmentation and sybil attacks by dynamically concentrating liquidity around uncertain outcomes (40-60% odds) using its pm-AMM, which auto-adjusts exposure as events near resolution. Markets bootstrapped via bonding curves incentivize balanced trading, then graduate to efficient AMMs. An AI agent oracle resolves outcomes, but users can stake collateral to dispute errors—creating a self-improving oracle that delivers trusted real-world data, outperforming platforms reliant on static liquidity models or centralized resolution.
        </p>
        <div className="mt-4 border-l-4 border-[#F900BF]/40 pl-4 bg-black/20 py-2">
          <p className="text-white/80 italic">
            Built for Monad Hackathon, leveraging Monad's high-TPS blockchain.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="backdrop-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <h3 className="text-lg font-medium text-[#F900BF] mt-6 mb-3">Dynamic Liquidity</h3>
        <p className="text-white/90 mb-4">
          frfn's pm-AMM auto-concentrates liquidity around uncertain outcomes, improving capital efficiency and reducing slippage.
        </p>
        <h3 className="text-lg font-medium text-[#F900BF] mt-6 mb-3">Market Lifecycle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="backdrop-panel p-4">
            <div className="text-[#F900BF] text-lg font-bold mb-2">1. Creation</div>
            <p className="text-white/80 text-sm">Markets start with bonding curves for initial trading.</p>
          </div>
          <div className="backdrop-panel p-4">
            <div className="text-[#F900BF] text-lg font-bold mb-2">2. Trading</div>
            <p className="text-white/80 text-sm">Dynamic liquidity concentration around uncertain outcomes.</p>
          </div>
          <div className="backdrop-panel p-4">
            <div className="text-[#F900BF] text-lg font-bold mb-2">3. Resolution</div>
            <p className="text-white/80 text-sm">AI oracle resolves outcomes, with user-staked disputes.</p>
          </div>
        </div>
      </div>

      {/* Current Implementation Section */}
      <div className="backdrop-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Implementation</h2>
        <p className="text-white/90 mb-4">
          Currently live on Monad Testnet with basic market creation, trading, and manual resolution.
        </p>
      </div>

      {/* Advanced Implementation Plans Section */}
      <div className="backdrop-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Future Plans</h2>
        <ul className="list-disc list-inside space-y-2 text-white/80">
          <li>Black-Scholes model integration (implemented)</li>
          <li>Uniswap v4 hook deployment (awaiting Monad)</li>
          <li>AI oracle for automated resolution</li>
        </ul>
      </div>

      {/* Technical Architecture Section */}
      <div className="backdrop-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Technical Architecture</h2>
        <p className="text-white/90 mb-4">
          Smart contracts for market creation, basic AMM, and USDC trading. Future integration with Uniswap v4 and AI oracle.
        </p>
      </div>

      {/* Roadmap Section */}
      <div className="backdrop-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Roadmap</h2>
        <ul className="list-disc list-inside space-y-2 text-white/80">
          <li>Current: Basic implementation on Monad Testnet</li>
          <li>Phase 1: Black-Scholes integration</li>
          <li>Phase 2: Uniswap v4 hook deployment</li>
          <li>Phase 3: AI oracle integration</li>
          <li>Phase 4: Monad Mainnet launch</li>
        </ul>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link href="/markets">
          <Button variant="primary" size="lg" glowing>
            Explore Markets
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
} 