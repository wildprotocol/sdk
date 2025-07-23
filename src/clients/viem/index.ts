import type { ViemSDKConfig } from "./types";
import { ViemDeployerReader } from "./viem-deployer-read";
import { ViemDeployerWriter } from "./viem-deployer-write";

class ViemDeployer {
  public read: ViemDeployerReader;
  public write: ViemDeployerWriter | null;

  constructor(config: ViemSDKConfig) {
    this.read = new ViemDeployerReader(config);

    if (config.walletClient || config.privateKey) {
      this.write = new ViemDeployerWriter(config);
    } else {
      this.write = null;
      console.warn(
        "[ViemDeployer] No walletClient or privateKey provided. Writer methods are disabled."
      );
    }
  }
}

export { ViemDeployer };
