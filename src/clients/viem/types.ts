import type { WalletClient } from "viem";
import type { SupportedNetworks } from "../../config";

export interface ViemSDKConfig {
  rpcUrl: string;
  walletClient?: WalletClient;
  privateKey?: string;
  network: SupportedNetworks;
  version: "v2" | "v3";
}
