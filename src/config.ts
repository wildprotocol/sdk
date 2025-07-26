import { BaseTokenConfig } from "./types";

export interface ContractAddresses {
  DEPLOYER_ADDRESS: string;
  STATE_MANAGER_ADDRESS: string;
  LP_LOCKER_ADDRESS: string;
}

export type SupportedVersions = "v2" | "v3";
export type SupportedNetworks = "base-sepolia" | "base-mainnet";
export const LATEST_VERSION = "v3";

export const CONTRACTS: Record<
  SupportedVersions,
  Record<SupportedNetworks, ContractAddresses>
> = {
  v2: {
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
  },
  v3: {
    "base-sepolia": {
      DEPLOYER_ADDRESS: "0x7A503121f654950Efd3FF29a9eB48666dAf3Cb5B",
      STATE_MANAGER_ADDRESS: "0x8807e3d35B5BF2668D1508A417fe812fd699a386",
      LP_LOCKER_ADDRESS: "0xc58b8697FA02e84E11d3Aed842AE4E06A21b5aC4",
    },
    "base-mainnet": {
      DEPLOYER_ADDRESS: "0x065EE5e9Ab0A4A382a5763f935176B880d512b06",
      STATE_MANAGER_ADDRESS: "0xC67348A3a3F51f8d4BEE9EB792614b7AD4248786",
      LP_LOCKER_ADDRESS: "0x44C7CFf0C5472963Fa50ea8002b17DA53688C736",
    },
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
    address: "0x0000000000000000000000000000000000000000",
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
