interface ContractAddresses {
  marketFactory: `0x${string}`;
  tokenMinter: `0x${string}`;
  testCollateral: `0x${string}`;
  hook: `0x${string}`;
  dynamicPoolBasedMinter: `0x${string}`;
  markets: {
    btcPrice: `0x${string}`;
    aiModel: `0x${string}`;
    geopolitical: `0x${string}`;
    sports: `0x${string}`;
    solanaAth: `0x${string}`;
  };
}

// Actual deployed contract addresses from deploy scripts
export const monadTestnetAddresses: ContractAddresses = {
  // MarketFactory contract from FixedDeploy script
  marketFactory: '0x16b35DECec3B0b6461917deE20039487618423C8',
  
  // TokenMinter contract from FixedDeploy script 
  tokenMinter: '0x52eF32954B37395aad11438E2B7C1a65AAfC0c51',
  
  // Official Monad Testnet USDC
  testCollateral: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  
  // For now, we'll keep the special approach to test redemption
  // We'll hardcode references to older Hook contracts that have the functions
  hook: '0x3fF7f148bbE9ccc203232BD8662F09fd5B15C888',
  
  // Older DynamicPoolBasedMinter contract that works with our UI
  dynamicPoolBasedMinter: '0x1E0bd4808fb69af833384119ab2D5718Ee141E3C',
  
  // Deployed markets
  markets: {
    btcPrice: '0xB5599ac305D498Fc4a69b8606D0f15d573510ce6',
    aiModel: '0xc281Ec0dba64aa2332D94D3E968b46752D2EEa95',
    geopolitical: '0x4FAe92879Ed18fd4E0a935c38f597229df66C873',
    sports: '0x3FdC864abed386f0f9Ee0dA49B5f98FaBE4aAFD9',
    solanaAth: '0x7D9D07D3a2d7a4E15D3A8bfB301bB25c5908eAaF'
  }
};

export const getAddresses = (chainId: number): ContractAddresses => {
  switch (chainId) {
    case 10143: // Monad Testnet
      return monadTestnetAddresses;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};