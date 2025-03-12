'use client';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { monadTestnet } from './config/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// You need to get a project ID from https://cloud.walletconnect.com/
// Replace this with your actual project ID when deploying
const WALLET_CONNECT_PROJECT_ID = '36f4179dcf6b75878dc7c2732f29d441';

// Primary RPC provider
const { chains: primaryChains, publicClient: primaryClient } = configureChains(
  [monadTestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
  ]
);

// Fallback RPC provider
const { chains, publicClient } = configureChains(
  [monadTestnet],
  [
    // Try primary provider first
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
    // Then fallback to secondary provider
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[1],
      }),
    }),
    // Last resort
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: WALLET_CONNECT_PROJECT_ID, chains }),
      coinbaseWallet({ appName: 'PM-AMM Prediction Markets', chains }),
      walletConnectWallet({ projectId: WALLET_CONNECT_PROJECT_ID, chains }),
      injectedWallet({ chains }),
      phantomWallet({ chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: 1
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}