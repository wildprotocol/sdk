import type { SupportedNetworks } from '../../config';
import type { ViemSDKConfig } from './types';
import { ViemDeployerReader } from './viem-deployer-read';
import { ViemDeployerWriter } from './view-deployer-write';


class ViemDeployer {
  public read: ViemDeployerReader;
  public write: ViemDeployerWriter;

  constructor(config: ViemSDKConfig & { network: SupportedNetworks }) {
    this.read = new ViemDeployerReader(config);
    this.write = new ViemDeployerWriter(config);
  }
}

export { ViemDeployer };
