import React from "react";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { monadTestnet } from "../config/chains";
import "../styles/globals.css";

// Create wagmi config with ConnectKit
const config = createConfig(
  getDefaultConfig({
    appName: "Prediction Markets",
    chains: [monadTestnet],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  })
);

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <Component {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
