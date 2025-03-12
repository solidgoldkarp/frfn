'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleMarketFactory } from '../../hooks/useSimpleMarketFactory';
import { simpleBookie } from '../../contracts/simpleBookie';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import PageContainer from '../../components/layout/PageContainer';
import StatusIndicator from '../../components/ui/StatusIndicator';

export default function CreateMarketPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [question, setQuestion] = useState('');
  const [resolutionDays, setResolutionDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Factory contract address
  const factoryAddress = simpleBookie.monadTestnet.factory as `0x${string}`;
  
  // Get create function from factory hook
  const { createNewMarket, isLoading } = useSimpleMarketFactory(factoryAddress);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!question.trim()) {
      setError("Please enter a valid question");
      return;
    }
    
    if (resolutionDays < 1) {
      setError("Resolution time must be at least 1 day in the future");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate resolution time (current time + days in seconds)
      const resolutionTime = Math.floor(Date.now() / 1000) + (resolutionDays * 24 * 60 * 60);
      
      // Create the market
      await createNewMarket(question, resolutionTime);
      
      setSuccessMessage("Market created successfully!");
      
      // Reset form
      setQuestion('');
      setResolutionDays(30);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/markets');
      }, 2000);
    } catch (error) {
      console.error('Error creating market:', error);
      setError(error instanceof Error ? error.message : "Failed to create market");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#F900BF] mb-2">
            Create a New Market
          </h1>
          <p className="text-white/70 text-sm">
            Define your prediction market question and parameters
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link href="/markets" className="text-white/70 hover:text-white">
            ← Back to Markets
          </Link>
          <ConnectButton />
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="backdrop-panel p-4 mb-6 border-green-500/50 border">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white">{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="backdrop-panel p-4 mb-6 border-red-500/50 border">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-white">{error}</p>
          </div>
        </div>
      )}
      
      {/* Create Market Form */}
      <div className="backdrop-panel p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-medium text-white mb-2">
              Market Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will BTC reach $100k by the end of 2025?"
              className="w-full bg-black/30 backdrop-blur-md border border-white/20 p-3 text-white focus:outline-none focus:border-[#F900BF]/50"
              required
            />
            <p className="mt-2 text-sm text-white/50">
              Make sure your question has a clear binary (YES/NO) outcome.
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="resolutionDays" className="block text-sm font-medium text-white mb-2">
              Resolution Time (days from now)
            </label>
            <input
              id="resolutionDays"
              type="number"
              min="1"
              max="365"
              value={resolutionDays}
              onChange={(e) => setResolutionDays(parseInt(e.target.value))}
              className="w-full bg-black/30 backdrop-blur-md border border-white/20 p-3 text-white focus:outline-none focus:border-[#F900BF]/50"
              required
            />
            <p className="mt-2 text-sm text-white/50">
              The market will be resolved after this many days.
            </p>
          </div>
          
          <div className="mt-8">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || isLoading || !isConnected}
            >
              {isSubmitting || isLoading ? 'Creating Market...' : 'Create Market'}
            </Button>
            
            {!isConnected && (
              <div className="mt-4 text-center text-white/50 text-sm">
                Connect your wallet to create a market
              </div>
            )}
          </div>
        </form>
      </div>
      
      {/* How It Works */}
      <div className="backdrop-panel p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 text-white/70">
          <div>
            <h3 className="font-medium text-[#F900BF]">1. Create a Market</h3>
            <p>Define a binary question with a clear resolution date.</p>
          </div>
          <div>
            <h3 className="font-medium text-[#F900BF]">2. Users Place Bets</h3>
            <p>Users bet on YES or NO outcomes using USDC.</p>
          </div>
          <div>
            <h3 className="font-medium text-[#F900BF]">3. Market Resolution</h3>
            <p>After the resolution date, the market creator will resolve the market with the correct outcome.</p>
          </div>
          <div>
            <h3 className="font-medium text-[#F900BF]">4. Winners Redeem</h3>
            <p>Users who bet on the correct outcome can redeem their original stake plus a proportional share of the losing side's bets.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 backdrop-panel p-4">
        <div className="flex items-center">
          <StatusIndicator status="active" label="Market Creation" />
          <span className="ml-3 text-white/50 text-xs">Permissionless & censorship-resistant</span>
        </div>
      </div>
    </PageContainer>
  );
}