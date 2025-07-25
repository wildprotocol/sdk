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
      DEPLOYER_ADDRESS: "0x5d4B920bCD55037f17b0B1A27829875Dc2A34c4c",
      STATE_MANAGER_ADDRESS: "0x3a9196d9784DDD41d80404d465c3aEA552A97D61",
      LP_LOCKER_ADDRESS: "0x4c0Ca86c182a6CDc69C2Aa62d2BB07C700f44df6",
    },
    "base-mainnet": {
      DEPLOYER_ADDRESS: "0x642E9dBc05776A09C9A6823d324C9f39280d2f61",
      STATE_MANAGER_ADDRESS: "0xFcAe3745B5430875928284C64cb94E345b12a407",
      LP_LOCKER_ADDRESS: "0xfa2b15A03eaEe25c9e5563485d20a34B7Cc9881A",
    },
  },
};
