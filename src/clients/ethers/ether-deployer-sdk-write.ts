import { ethers, ContractTransactionResponse, parseEther, Contract } from 'ethers';

import { SDKConfig, BuyTokenParams, SellTokenParams, TransactionOptions, LaunchTokenParams, TokenDeploymentConfig } from '../../types';
import { CONTRACTS, SupportedNetworks } from '../../config';
import { DEPLOYER_ABI } from '../../abis/deployer-abi';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)'
];

export class DeployerWriter {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(config: SDKConfig & { network: SupportedNetworks }) {
    if (!config.rpcUrl) throw new Error('RPC URL is required');

    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts) throw new Error(`Unsupported network: ${config.network}`);

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    } else if (config.signer) {
      this.signer = config.signer;
    }

    const signerOrProvider = this.signer || this.provider;

    this.contract = new ethers.Contract(networkContracts.DEPLOYER_ADDRESS, DEPLOYER_ABI, signerOrProvider);
  }

  /**
 * Buy a token by sending base tokens to the bonding curve
 * @param params Parameters including token address, input amount, minimum output amount, and recipient
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async buyToken(params: BuyTokenParams, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for buy transactions');

  const txOptions: any = {
    value: params.value ? parseEther(params.value) : parseEther(params.amountIn),
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.buyToken(params.token, parseEther(params.amountIn), parseEther(params.amountOutMin), params.to, txOptions);
}

/**
 * Sell tokens from the bonding curve
 * @param params Parameters including token address, input amount, minimum output amount, and recipient
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async sellToken(params: SellTokenParams, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for sell transactions');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.sellToken(params.token, parseEther(params.amountIn), parseEther(params.amountOutMin), params.to, txOptions);
}

/**
 * Approve the deployer contract to spend a specific token on the user's behalf
 * @param token ERC20 token address
 * @param amount Amount to approve
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async approveToken(token: string, amount: string, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for approving tokens');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  const erc20Contract = new Contract(token, ERC20_ABI, this.signer);
  const deployerAddress = await this.contract.getAddress();

  return await erc20Contract.approve(deployerAddress, parseEther(amount), txOptions);
}

/**
 * Claim accumulated bonding curve fees for a specific token
 * @param token Token address
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async claimFee(token: string, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for claiming fees');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.claimFee(token, txOptions);
}

/**
 * Launch a new token using the bonding curve
 * @param params Token launch parameters including supplies, fees, and configuration
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async launchToken(params: LaunchTokenParams, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for launching tokens');

  const config = this.buildTokenDeploymentConfig(params);

  const txOptions: any = {
    gasLimit: options?.gasLimit || 2000000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.launchToken(config, txOptions);
}

/**
 * Graduate a token from the bonding curve (can allow forced graduation)
 * @param token Token address
 * @param allowPreGraduation Allow forced graduation if true
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async graduateToken(token: string, allowPreGraduation: boolean = false, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for graduating tokens');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 1000000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.graduateToken(token, allowPreGraduation, txOptions);
}

/**
 * Set the whitelist status of a base token
 * @param token Token address
 * @param whitelisted Boolean flag to whitelist (true) or remove from whitelist (false)
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async setBaseTokenWhitelist(token: string, whitelisted: boolean, options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required for setting base token whitelist');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.setBaseTokenWhitelist(token, whitelisted, txOptions);
}

/**
 * Relinquish control of the state manager to the protocol
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async relinquishStateManager(options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required to relinquish state manager');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.relinquishStateManager(txOptions);
}

/**
 * Withdraw residual (dust) base tokens from the contract
 * @param options Optional transaction parameters like gas limit and gas price
 * @returns Transaction response
 */
async withdrawDust(options?: TransactionOptions): Promise<ContractTransactionResponse> {
  if (!this.signer) throw new Error('Signer is required to withdraw dust');

  const txOptions: any = {
    gasLimit: options?.gasLimit || 500000
  };
  if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

  return await this.contract.withdrawDust(txOptions);
}

  private buildTokenDeploymentConfig(params: LaunchTokenParams): TokenDeploymentConfig {
    const totalSupply = (
      BigInt(params.teamSupply) +
      BigInt(params.bondingCurveSupply) +
      BigInt(params.liquidityPoolSupply)
    ).toString();

    return {
      creator: params.creator,
      baseToken: params.baseToken,
      name: params.name,
      symbol: params.symbol,
      image: params.image,
      appIdentifier: '',
      teamSupply: params.teamSupply,
      vestingStartTime: params.vestingStartTime || '0',
      vestingDuration: params.vestingDuration || '0',
      vestingWallet: params.vestingWallet || ethers.ZeroAddress,
      bondingCurveSupply: params.bondingCurveSupply,
      liquidityPoolSupply: params.liquidityPoolSupply,
      totalSupply: totalSupply,
      bondingCurveBuyFee: params.bondingCurveBuyFee,
      bondingCurveSellFee: params.bondingCurveSellFee,
      bondingCurveFeeSplits: params.bondingCurveFeeSplits.map(split => ({
        recipient: split.recipient,
        bps: split.bps
      })),
      bondingCurveParams: {
        prices: params.bondingCurveParams.prices,
        numSteps: params.bondingCurveParams.numSteps,
        stepSize: params.bondingCurveParams.stepSize
      },
      allowForcedGraduation: params.allowForcedGraduation,
      graduationFeeBps: params.graduationFeeBps,
      graduationFeeSplits: params.graduationFeeSplits.map(split => ({
        recipient: split.recipient,
        bps: split.bps
      })),
      poolFees: params.poolFees,
      poolFeeSplits: params.poolFeeSplits.map(split => ({
        recipient: split.recipient,
        bps: split.bps
      })),
      surgeFeeStartingTime: Math.floor(Date.now() / 1000).toString(),
      surgeFeeDuration: params.surgeFeeDuration,
      maxSurgeFeeBps: params.maxSurgeFeeBps
    };
  }
}
