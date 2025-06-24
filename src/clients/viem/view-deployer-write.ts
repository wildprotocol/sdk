import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { DEPLOYER_ABI } from '../../abis/deployer-abi';
import { CONTRACTS } from '../../config';
import {
  Address,
  BuyTokenParams,
  LaunchTokenParams,
  SellTokenParams,
  TokenDeploymentConfig,
  TransactionOptions
} from '../../types';

import { waitForTransactionReceipt } from 'viem/actions';
import { validateFeeSplitArray, validateLaunchTokenBondingCurveParams } from '../../utils/validators';
import type { ViemSDKConfig } from './types';
import { extractEventArgument } from '../../utils/helper';

export class ViemDeployerWriter {
  protected config: ViemSDKConfig;
  protected publicClient: any;
  protected walletClient: any;
  protected deployerAddress: string;
  protected stateManagerAddress: string;

  constructor(config: ViemSDKConfig) {
    this.config = config;
  
    if (!config.rpcUrl) throw new Error('RPC URL is required');
    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts) throw new Error(`Unsupported network: ${config.network}`);
  
    this.deployerAddress = networkContracts.DEPLOYER_ADDRESS;
    this.stateManagerAddress = networkContracts.STATE_MANAGER_ADDRESS;
  
    this.publicClient = createPublicClient({
      transport: http(config.rpcUrl),
    });
  
    if (config.walletClient) {
      // If consumer passed a connected wallet client (ex: from viem/wagmi)
      this.walletClient = config.walletClient;
    } else if (config.privateKey) {
      const account = privateKeyToAccount(config.privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        transport: http(config.rpcUrl),
      });
    } else {
      throw new Error('Wallet Client or Private Key is required for write operations');
    }
  }

 
  private buildTxOptions(options?: TransactionOptions) {
    const txOptions: any = {};
    if (options?.gasLimit) txOptions.gasLimit = options.gasLimit;
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;
    return txOptions;
  }

  async buyToken(params: BuyTokenParams, options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'buyToken',
      args: [
        params.token as `0x${string}`,
        parseEther(params.amountIn),
        parseEther(params.amountOutMin),
        params.to as `0x${string}`,
      ],
      value: parseEther(params.value || params.amountIn),
      ...this.buildTxOptions(options),
    });
    return tx
  }

  async sellToken(params: SellTokenParams, options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'sellToken',
      args: [
        params.token as `0x${string}`,
        parseEther(params.amountIn),
        parseEther(params.amountOutMin),
        params.to as `0x${string}`,
      ],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async approveToken(token: string, amount: string, options?: TransactionOptions) {
    const ERC20_ABI = [
      {
        "inputs": [
          { "internalType": "address", "name": "spender", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    const tx = await this.walletClient.writeContract({
      address: token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [this.deployerAddress as `0x${string}`, parseEther(amount)],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async approveAndSell(params: SellTokenParams, options?: TransactionOptions) {
    await this.approveToken(params.token, params.amountIn, options);
    console.log('Approval successful');
  
    const txHash = await this.sellToken(params, options);
    console.log('Sell transaction sent:', txHash);
  
    return txHash;
  }

  async claimFee(token: string, options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'claimFee',
      args: [token as `0x${string}`],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  /**
   * Launch a new token using the bonding curve
   * @param params Token launch parameters including supplies, fees, and configuration
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   * Protocol fee in basis points (bps).
   * Required. This fee will automatically be allocated to the protocol.
   * Example: 500 = 5%
 */
  async launchToken(params: LaunchTokenParams, options?: TransactionOptions) {
    validateLaunchTokenBondingCurveParams(params);
    validateFeeSplitArray(params.bondingCurveFeeSplits, "bondingCurveFeeSplits");
    validateFeeSplitArray(params.poolFeeSplits, "poolFeeSplits");
    validateFeeSplitArray(params.graduationFeeSplits, "graduationFeeSplits");
    
    const config = this.buildTokenDeploymentConfig(params);
  
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'launchToken',
      args: [config],
      ...this.buildTxOptions(options),
    });

    const receipt = await waitForTransactionReceipt(this.walletClient,{ hash: tx });

    const createdTokenAddress = extractEventArgument({
      logs: receipt.logs,
      eventName: 'TokenLaunched',
      argumentName: 'token'
    });
  
    if (!createdTokenAddress) throw new Error('TokenLaunched event not found');
  
    return { tx, createdTokenAddress };
  }
  
  
  async graduateToken(token: string, allowPreGraduation: boolean = false, options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'graduateToken',
      args: [token as `0x${string}`, allowPreGraduation],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async setBaseTokenWhitelist(token: string, whitelisted: boolean, options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'setBaseTokenWhitelist',
      args: [token as `0x${string}`, whitelisted],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async relinquishStateManager(options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'relinquishStateManager',
      args: [],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async withdrawDust(options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'withdrawDust',
      args: [],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async waitForTransaction(txHash: `0x${string}`) {
    try {
      const receipt = await waitForTransactionReceipt(this.publicClient, { hash: txHash });
      return receipt;
    } catch (error) {
      console.error('Error waiting for transaction receipt:', error);
      throw error;
    }
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
      teamSupply: BigInt(params.teamSupply),
      vestingStartTime: params.vestingStartTime ? BigInt(params.vestingStartTime) : BigInt(0),
      vestingDuration: params.vestingDuration ? BigInt(params.vestingDuration) : BigInt(0),
      vestingWallet: params.vestingWallet ? params.vestingWallet : '0x0000000000000000000000000000000000000000',
      bondingCurveSupply: BigInt(params.bondingCurveSupply),
      liquidityPoolSupply: BigInt(params.liquidityPoolSupply),
      totalSupply: BigInt(totalSupply),
      bondingCurveBuyFee: BigInt(params.bondingCurveBuyFee),
      bondingCurveSellFee: BigInt(params.bondingCurveSellFee),
      bondingCurveFeeSplits: params.bondingCurveFeeSplits.map(split => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      bondingCurveParams: {
        prices: params.bondingCurveParams.prices.map(price => BigInt(price)),
        numSteps: BigInt(params.bondingCurveParams.numSteps),
        stepSize: BigInt(params.bondingCurveParams.stepSize),
      },
      allowForcedGraduation: params.allowForcedGraduation,
      graduationFeeBps: BigInt(params.graduationFeeBps),
      graduationFeeSplits: params.graduationFeeSplits.map(split => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      poolFees: params.poolFees,
      poolFeeSplits: params.poolFeeSplits.map(split => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      surgeFeeStartingTime: BigInt(Math.floor(Date.now() / 1000)),
      surgeFeeDuration: BigInt(params.surgeFeeDuration),
      maxSurgeFeeBps: BigInt(params.maxSurgeFeeBps),
    };
  }
}
