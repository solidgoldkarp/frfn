import React, { useState } from "react";
import { useRouter } from "next/router";
import PageContainer from "../../../components/layout/PageContainer";
import Button from "../../../components/ui/Button";
import { useSimpleMarketFactory } from "../../../hooks/useSimpleMarketFactory";

export default function CreateMarketPage() {
  const router = useRouter();
  const { createMarket, isCreating } = useSimpleMarketFactory();
  
  const [question, setQuestion] = useState("");
  const [resolutionDays, setResolutionDays] = useState(7);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate resolution time in seconds (current time + days)
      const resolutionTime = Math.floor(Date.now() / 1000) + (resolutionDays * 24 * 60 * 60);
      
      // Create the market
      await createMarket(question, resolutionTime);
      
      // Redirect to markets page
      router.push("/markets/simple");
    } catch (error) {
      console.error("Error creating market:", error);
      alert("Failed to create market. See console for details.");
    }
  };
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create a New Market</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Market Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Will ETH reach $10,000 by end of 2025?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Resolution Time (days from now)
            </label>
            <input
              type="number"
              value={resolutionDays}
              onChange={(e) => setResolutionDays(parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <Button type="submit" disabled={isCreating || \!question}>
            {isCreating ? "Creating..." : "Create Market"}
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
