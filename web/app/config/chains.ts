import { defineChain } from 'viem';
import { erc20Abi } from '../contracts/abis/erc20Abi';
import { parseUnits } from 'ethers/lib/utils';
import { usePublicClient, useContractWrite, useAccount } from 'wagmi';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://monad-testnet.g.alchemy.com/v2/a6Adal-zVFlHwsjmXteq-D68t1SkY7pr',
      ],
    },
    public: {
      http: [
        'https://monad-testnet.g.alchemy.com/v2/a6Adal-zVFlHwsjmXteq-D68t1SkY7pr',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Blockscout',
      url: 'https://testnet.monadexplorer.com',
    },
  },
});