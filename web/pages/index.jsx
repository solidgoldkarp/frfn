import React from "react";
import PageContainer from "../components/layout/PageContainer";

export default function Home() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Simple Bookie Prediction Markets</h1>
        <p className="text-gray-700 mb-4">
          A straightforward prediction market platform that follows a bookie-style betting model.
        </p>
        <div className="grid gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Betting</strong>: Users bet YES or NO by depositing USDC</li>
              <li><strong>Probability</strong>: Market probability is calculated as YES bets / total bets</li>
              <li><strong>Resolution</strong>: Admin resolves the market after the resolution time</li>
              <li><strong>Redemption</strong>: Winners get their original bet back plus a proportional share of losing bets</li>
            </ol>
          </div>
        </div>
        <div className="mt-8">
          <a href="/markets/simple" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            View Markets
          </a>
        </div>
      </div>
    </PageContainer>
  );
}
