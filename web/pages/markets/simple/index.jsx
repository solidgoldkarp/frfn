import React from "react";
import PageContainer from "../../../components/layout/PageContainer";
import { useSimpleMarketFactory } from "../../../hooks/useSimpleMarketFactory";
import SimpleMarketCard from "../../../components/SimpleMarketCard";
import Loading from "../../../components/ui/Loading";

export default function MarketsPage() {
  const { markets, loading, error } = useSimpleMarketFactory();

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Markets</h1>
          <a href="/markets/simple/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Create Market
          </a>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : error ? (
          <div className="text-red-500 py-8">Error loading markets: {error.message}</div>
        ) : markets.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No markets found</div>
        ) : (
          <div className="grid gap-6">
            {markets.map((market) => (
              <SimpleMarketCard key={market.address} market={market} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
