import { SDKConfig } from './types';
import { SupportedNetworks } from './config';
import { DeployerReader as EthersReader } from './clients/ethers/ether-deployer-sdk-read';
import { DeployerWriter as EthersWriter } from './clients/ethers/ether-deployer-sdk-write';
import { ViemDeployerReader } from './clients/viem/viem-deployer-read';
import { ViemDeployerWriter } from './clients/viem/view-deployer-write';

export class DeployerSDK {
  public read: EthersReader | ViemDeployerReader;
  public write: EthersWriter | ViemDeployerWriter;

  constructor(config: SDKConfig & { network: SupportedNetworks }) {
    if (config.client === 'ethers') {
      this.read = new EthersReader(config);
      this.write = new EthersWriter(config);
    } else if (config.client === 'viem') {
      this.read = new ViemDeployerReader(config);
      this.write = new ViemDeployerWriter(config);
    } else {
      throw new Error('Unsupported client type. Use "ethers" or "viem".');
    }
  }
}
