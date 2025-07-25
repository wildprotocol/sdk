import { BaseTokenConfig } from "./types";

export type SupportedNetworks = keyof typeof CONTRACTS;

export const CONTRACTS = {
  "base-sepolia": {
    DEPLOYER_ADDRESS: "0xa24A0a0BcF100415261cAA60D1C7A7b68D6cdA79",
    STATE_MANAGER_ADDRESS: "0x6d39f47465696c74138207616Ad1Fcd4E276cdDA",
    LP_LOCKER_ADDRESS: "0xc068a5c4552dC9703bA2020F27791eAfb6ad3aac",
  },
  "base-mainnet": {
    DEPLOYER_ADDRESS: "0xF7cb0460771FB72Ad07C34B6744b36aA51399068",
    STATE_MANAGER_ADDRESS: "0x032625946994d7719481a1841a066b355B65a1F7",
    LP_LOCKER_ADDRESS: "0x60B284a349DEF0C34D8271db74B3E48229f4f659",
  },
};

export const SUPPORTED_BASE_TOKENS: BaseTokenConfig[] = [
  {
    chainId: 8453,
    address: "0x0000000000000000000000000000000000000000",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    logoURI: "https://static.optimism.io/data/ETH/logo.svg",
  },
  {
    chainId: 8453,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "https://ethereum-optimism.github.io/data/USDC/logo.png",
  },
  {
    chainId: 84532,
    "address": "0x0000000000000000000000000000000000000000",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    logoURI: "https://static.optimism.io/data/ETH/logo.svg",
  },
  {
    chainId: 84532,
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "https://ethereum-optimism.github.io/data/USDC/logo.png",
  },
  {
    chainId: 84532,
    address: "0xCA11121e2e8D5f5C183eEa0261a85D9bb06587C7",
    name: "USDC Monk",
    symbol: "USDC",
    decimals: 6,
  },
];
