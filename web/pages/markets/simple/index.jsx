import React from "react";
import { useSimpleMarketFactory } from "../../../hooks/useSimpleMarketFactory";

export default function MarketsPage() {
  const { markets, loading, error } = useSimpleMarketFactory();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Markets</h1>
        <a href="/markets/simple/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Create Market
        </a>
      </div>
      
      <div className="grid gap-6">
        {markets.map((market, index) => (
          <div key={market} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Example Market #{index + 1}</h2>
            <p className="text-gray-700 mb-4">Will ETH reach $10,000 by end of 2025?</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>YES: 60%</span>
              <span>NO: 40%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 mt-1 mb-4 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
            </div>
            <a href={`/markets/${market}`} className="text-blue-600 hover:underline">View market</a>
          </div>
        ))}
      </div>
    </div>
  );
}