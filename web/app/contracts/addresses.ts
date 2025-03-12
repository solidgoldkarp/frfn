interface ContractAddresses {
  marketFactory: `0x${string}`;
  tokenMinter: `0x${string}`;
  testCollateral: `0x${string}`;
  hook: `0x${string}`;
  dynamicPoolBasedMinter: `0x${string}`;
}

// Actual deployed contract addresses from deploy scripts
export const monadTestnetAddresses: ContractAddresses = {
  // MarketFactory contract from FixedDeploy script
  marketFactory: '0x39E1c0a27104E71C921778Ff7C4Fb1f765C3d029',
  
  // TokenMinter contract from FixedDeploy script 
  tokenMinter: '0x52eF32954B37395aad11438E2B7C1a65AAfC0c51',
  
  // Official Monad Testnet USDC
  testCollateral: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  
  // For now, we'll keep the special approach to test redemption
  // We'll hardcode references to older Hook contracts that have the functions
  hook: '0x3fF7f148bbE9ccc203232BD8662F09fd5B15C888',
  
  // Older DynamicPoolBasedMinter contract that works with our UI
  dynamicPoolBasedMinter: '0x1E0bd4808fb69af833384119ab2D5718Ee141E3C'
};

export const getAddresses = (chainId: number): ContractAddresses => {
  switch (chainId) {
    case 10143: // Monad Testnet
      return monadTestnetAddresses;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};