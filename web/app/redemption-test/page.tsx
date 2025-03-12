'use client';

import React, { useState, useCallback } from 'react';
import { useMarket } from '../hooks/useMarket';
import { formatProbability } from '../utils/format';
import { Button } from '../components/ui/Button';
import { UserPosition } from '../components/UserPosition';
import { useAccount } from 'wagmi';

// The address of the special Hook contract with redemption functionality
const REDEMPTION_TEST_MARKET_ADDRESS = '0x3fF7f148bbE9ccc203232BD8662F09fd5B15C888';

const RedemptionTestPage: React.FC = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'info' | 'trade' | 'admin'>('info');
  
  // Use the market hook with our special Hook contract
  const { 
    marketInfo,
    currentProbability,
    isLoading,
    mintTokens,
    swapTokens,
    isSubmitting,
    txStatus,
    isMarketFinalized,
    marketWinner,
    redeemTokens,
    submitDecriptionShare,
    chooseWinner,
    manuallyFinalizeMarket,
    refetch
  } = useMarket(REDEMPTION_TEST_MARKET_ADDRESS);
  
  // Helper for showing transaction status
  const getStatusElement = () => {
    if (txStatus === 'pending') {
      return (
        <div className="bg-yellow-800 text-white p-3 rounded-lg mb-4 flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Transaction in progress...</span>
        </div>
      );
    } else if (txStatus === 'success') {
      return (
        <div className="bg-green-800 text-white p-3 rounded-lg mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Transaction successful!</span>
        </div>
      );
    } else if (txStatus === 'error') {
      return (
        <div className="bg-red-800 text-white p-3 rounded-lg mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          <span>Transaction failed. Please try again.</span>
        </div>
      );
    }
    
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        <p className="mt-4 text-gray-400">Loading redemption test market...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Token Redemption Test Market</h1>
      
      <div className="bg-blue-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          What is this?
        </h2>
        <p className="text-sm mt-2">
          This is a special market for testing the complete lifecycle of a prediction market, 
          including token redemption. Here you can:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm">
          <li>Buy YES and NO tokens with USDC</li>
          <li>Submit decryption shares to prepare for market resolution</li>
          <li>Resolve the market to YES or NO</li>
          <li>Redeem winning tokens for USDC</li>
        </ul>
      </div>
      
      {/* Market Status Info */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Market Status</h2>
          <Button onClick={refetch} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Finalized:</div>
            <div className={`font-bold ${isMarketFinalized ? 'text-green-400' : 'text-gray-300'}`}>
              {isMarketFinalized ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Winner:</div>
            <div className={`font-bold ${
              marketWinner === 'YES' ? 'text-green-400' : 
              marketWinner === 'NO' ? 'text-red-400' : 
              'text-gray-300'
            }`}>
              {marketWinner || 'Not set'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Status */}
      {getStatusElement()}
      
      {/* User Position */}
      {isConnected && (
        <div className="mb-6">
          <UserPosition marketAddress={REDEMPTION_TEST_MARKET_ADDRESS} />
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-4">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Market Info
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trade'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Buy Tokens
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admin'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Admin Controls
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {/* Market Info Tab */}
        {activeTab === 'info' && (
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Market Information</h3>
              
              {/* Current Probability */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-2">Current Probability</h4>
                <div className="text-2xl font-bold mb-2">{formatProbability(currentProbability)}</div>
                
                <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-green-600 h-full flex items-center justify-center text-xs font-semibold"
                      style={{ width: `${currentProbability}%` }}
                    >
                      YES
                    </div>
                    <div 
                      className="bg-red-600 h-full flex items-center justify-center text-xs font-semibold"
                      style={{ width: `${100 - currentProbability}%` }}
                    >
                      NO
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Token Redemption Process */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How Token Redemption Works</h4>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>The market creator sets up a question with a future resolution date</li>
                  <li>Users buy YES or NO tokens based on what they think the outcome will be</li>
                  <li>When the event occurs, decryption shares are submitted</li>
                  <li>The market is resolved by setting the winner (YES or NO)</li>
                  <li>Token holders can redeem their winning tokens for USDC</li>
                  <li>Winning tokens are worth 1 USDC each, losing tokens are worth 0</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        {/* Trade Tab */}
        {activeTab === 'trade' && (
          <div>
            {!isConnected ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="mb-4">Connect your wallet to trade tokens</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6">
                {isMarketFinalized ? (
                  // Redemption UI
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Redeem Tokens</h3>
                    <div className={`p-4 rounded-lg ${marketWinner === 'YES' ? 'bg-green-900' : 'bg-red-900'} mb-4`}>
                      <p className="mb-2">
                        This market has been resolved. The outcome is <span className="font-bold">{marketWinner}</span>.
                      </p>
                      <p>You can now redeem your winning tokens for USDC.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => redeemTokens('YES', '1')}
                        disabled={isSubmitting || marketWinner !== 'YES'}
                        className={`p-4 ${
                          marketWinner === 'YES' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Redeem YES Tokens
                      </Button>
                      <Button
                        onClick={() => redeemTokens('NO', '1')}
                        disabled={isSubmitting || marketWinner !== 'NO'}
                        className={`p-4 ${
                          marketWinner === 'NO' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Redeem NO Tokens
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Trading UI
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Buy Prediction Tokens</h3>
                    <p className="mb-4 text-sm">Purchase tokens with 1 USDC fixed amount (for testing).</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => swapTokens(false, '1')} // Buy YES
                        disabled={isSubmitting}
                        className="p-4 bg-green-600 hover:bg-green-700"
                      >
                        Buy YES Tokens
                      </Button>
                      <Button
                        onClick={() => swapTokens(true, '1')} // Buy NO
                        disabled={isSubmitting}
                        className="p-4 bg-red-600 hover:bg-red-700"
                      >
                        Buy NO Tokens
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        onClick={() => mintTokens('1')}
                        disabled={isSubmitting}
                        className="w-full p-4 bg-purple-600 hover:bg-purple-700"
                      >
                        Add Liquidity (Mint Both Tokens)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Admin Controls</h3>
              <p className="mb-4 text-sm">
                These functions allow you to test the market resolution process. In a real market,
                this would typically be handled by oracles or governance mechanisms.
              </p>
              
              {/* Market Resolution Flow */}
              <div className="space-y-6">
                {/* Step 1: Submit Decryption Share */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">1. Submit Decryption Share</h4>
                  <p className="text-sm mb-3">
                    Decryption shares are used to decrypt the final outcome. For testing, you can submit a simple string.
                  </p>
                  <Button
                    onClick={() => {
                      const shareText = prompt("Enter a decryption share (any text for testing):", "test-share");
                      if (shareText) submitDecriptionShare(shareText);
                    }}
                    disabled={isSubmitting || isMarketFinalized}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    Submit Decryption Share
                  </Button>
                </div>
                
                {/* Step 2: Resolve Market */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">2. Resolve Market</h4>
                  <p className="text-sm mb-3">
                    Choose the winning outcome for this market. This can only be done once and is irreversible.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => chooseWinner(true)}
                      disabled={isSubmitting || isMarketFinalized}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Resolve as YES
                    </Button>
                    <Button
                      onClick={() => chooseWinner(false)}
                      disabled={isSubmitting || isMarketFinalized}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Resolve as NO
                    </Button>
                  </div>
                </div>
                
                {/* UI-Only Resolution for Testing */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">For UI Testing Only</h4>
                  <p className="text-sm mb-3">
                    These buttons only update the UI state without writing to the blockchain. Use for frontend testing.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => manuallyFinalizeMarket(true, 'YES')}
                      className="bg-green-600 hover:bg-green-700 opacity-70"
                    >
                      Simulate YES Win
                    </Button>
                    <Button
                      onClick={() => manuallyFinalizeMarket(true, 'NO')}
                      className="bg-red-600 hover:bg-red-700 opacity-70"
                    >
                      Simulate NO Win
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedemptionTestPage;