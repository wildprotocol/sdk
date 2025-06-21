import { SDKConfig } from './types';
import { SupportedNetworks } from './config';
import { DeployerReader } from './deployer-sdk-read';
import { DeployerWriter } from './deployer-sdk-write';

export class DeployerSDK {
  public read: DeployerReader;
  public write: DeployerWriter;

  constructor(config: SDKConfig & { network: SupportedNetworks }) {
    this.read = new DeployerReader(config);
    this.write = new DeployerWriter(config);
  }
}
