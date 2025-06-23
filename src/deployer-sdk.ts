import type { SDKConfig } from './types';
import type { EthersDeployer as EthersDeployerType } from './clients/ethers';
import type { ViemDeployer as ViemDeployerType } from './clients/viem';

export class DeployerSDK {
  static async getDeployer<T extends SDKConfig>(
    config: T
  ): Promise<T['client'] extends 'ethers' ? EthersDeployerType : ViemDeployerType>;
  static async getDeployer(config: SDKConfig) {
    if (config.client === 'ethers') {
      const { EthersDeployer } = await import('./clients/ethers');
      return new EthersDeployer(config);
    } else if (config.client === 'viem') {
      const { ViemDeployer } = await import('./clients/viem');
      return new ViemDeployer(config);
    }
    throw new Error('Unsupported client type. Use "ethers" or "viem".');
  }
}
