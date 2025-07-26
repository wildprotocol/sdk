import type { SupportedNetworks } from "../../config";
import type { Signer } from "ethers";

export interface EthersSDKConfig {
  rpcUrl: string;
  signer?: Signer;
  privateKey?: string;
  network: SupportedNetworks;
  version: "v2" | "v3";
}
