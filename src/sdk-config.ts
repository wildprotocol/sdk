// sdk-config.ts

import type { SDKConfig } from './types';

export const sdkConfig: SDKConfig = {
  rpcUrl: 'https://your-rpc-url',
  contractAddress: '0xYourContractAddress',
  privateKey: '0xYourPrivateKey'
};

// (Optional) Allow runtime updates if needed
export function updateSDKConfig(newConfig: Partial<SDKConfig>) {
  Object.assign(sdkConfig, newConfig);
}
