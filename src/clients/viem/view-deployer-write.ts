import { parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, createWalletClient, http } from 'viem';

import { DEPLOYER_ABI } from '../../abis/deployer-abi';
import { CONTRACTS, SupportedNetworks } from '../../config';
import {
  SDKConfig,
  BuyTokenParams,
  SellTokenParams,
  TransactionOptions,
  LaunchTokenParams,
  TokenDeploymentConfig,
} from '../../types';

export class ViemDeployerWriter {
  protected config: SDKConfig & { network: SupportedNetworks };
  protected publicClient: any;
  protected walletClient: any;
  protected deployerAddress: string;
  protected stateManagerAddress: string;

  constructor(config: SDKConfig & { network: SupportedNetworks }) {
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
    if (options?.gas) txOptions.gas = options.gas;
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

    return tx;
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

  async launchToken(params: LaunchTokenParams, options?: TransactionOptions) {
    const config = this.buildTokenDeploymentConfig(params);

    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: 'launchToken',
      args: [config],
      ...this.buildTxOptions(options),
    });

    return tx;
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

  private buildTokenDeploymentConfig(params: LaunchTokenParams): TokenDeploymentConfig {
    const totalSupply = (
      BigInt(params.teamSupply) +
      BigInt(params.bondingCurveSupply) +
      BigInt(params.liquidityPoolSupply)
    ).toString();

    return {
      creator: params.creator as `0x${string}`,
      baseToken: params.baseToken as `0x${string}`,
      name: params.name,
      symbol: params.symbol,
      image: params.image,
      appIdentifier: '',
      teamSupply: params.teamSupply,
      vestingStartTime: params.vestingStartTime || '0',
      vestingDuration: params.vestingDuration || '0',
      vestingWallet: params.vestingWallet || '0x0000000000000000000000000000000000000000',
      bondingCurveSupply: params.bondingCurveSupply,
      liquidityPoolSupply: params.liquidityPoolSupply,
      totalSupply: totalSupply,
      bondingCurveBuyFee: params.bondingCurveBuyFee,
      bondingCurveSellFee: params.bondingCurveSellFee,
      bondingCurveFeeSplits: params.bondingCurveFeeSplits.map(split => ({
        recipient: split.recipient as `0x${string}`,
        bps: split.bps,
      })),
      bondingCurveParams: {
        prices: params.bondingCurveParams.prices,
        numSteps: params.bondingCurveParams.numSteps,
        stepSize: params.bondingCurveParams.stepSize,
      },
      allowForcedGraduation: params.allowForcedGraduation,
      graduationFeeBps: params.graduationFeeBps,
      graduationFeeSplits: params.graduationFeeSplits.map(split => ({
        recipient: split.recipient as `0x${string}`,
        bps: split.bps,
      })),
      poolFees: params.poolFees,
      poolFeeSplits: params.poolFeeSplits.map(split => ({
        recipient: split.recipient as `0x${string}`,
        bps: split.bps,
      })),
      surgeFeeStartingTime: Math.floor(Date.now() / 1000).toString(),
      surgeFeeDuration: params.surgeFeeDuration,
      maxSurgeFeeBps: params.maxSurgeFeeBps,
    };
  }
}
