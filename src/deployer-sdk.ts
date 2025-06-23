import type { SDKConfig } from './types';

export class DeployerSDK {
  async getDeployer(config: SDKConfig) {
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
