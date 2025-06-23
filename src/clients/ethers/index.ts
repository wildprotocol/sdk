import type { SupportedNetworks } from '../../config';
import type { EthersSDKConfig } from './types';
import { DeployerReader as EthersReader } from './ether-deployer-sdk-read';
import { DeployerWriter as EthersWriter } from './ether-deployer-sdk-write';


export class EthersDeployer {
  public read: EthersReader;
  public write: EthersWriter;

  constructor(config: EthersSDKConfig & { network: SupportedNetworks }) {
    this.read = new EthersReader(config);
    this.write = new EthersWriter(config);
  }
}