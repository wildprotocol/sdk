import { ethers, ContractTransactionResponse, parseEther, formatEther, BigNumberish } from 'ethers';
import { Contract } from 'ethers';
import { DEPLOYER_ABI } from './abi';
import {
  SDKConfig,
  BuyQuote,
  SellQuote,
  LaunchTokenParams,
  BuyTokenParams,
  SellTokenParams,
  TransactionOptions,
  TokenDeploymentConfig
} from './types';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export class DeployerSDK {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(config: SDKConfig) {
    // Initialize provider
    if (config.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    } else {
      throw new Error('RPC URL is required');
    }

    // Initialize signer if private key is provided
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    } else if (config.signer) {
      this.signer = config.signer;
    }

    // Initialize contract
    const signerOrProvider = this.signer || this.provider;
    this.contract = new ethers.Contract(config.contractAddress, DEPLOYER_ABI, signerOrProvider);
  }

  /**
   * Get a buy quote for a token
   * @param token Token address
   * @param amountIn Amount of base token to spend
   * @returns Buy quote with amount out, fee, and surge fee
   */
  async getBuyQuote(token: string, amountIn: string): Promise<BuyQuote> {
    try {
      const result = await this.contract.getBuyQuote(token, parseEther(amountIn));
      return {
        amountOut: result[0],
        amountInUsed: result[1],
        fee: result[2]
      };
    } catch (error) {
      throw new Error(`Failed to get buy quote: ${error}`);
    }
  }

  /**
   * Get a sell quote for a token
   * @param token Token address
   * @param amountIn Amount of tokens to sell
   * @returns Sell quote with amount out and fee
   */
  async getSellQuote(token: string, amountIn: string): Promise<SellQuote> {
    try {
      const result = await this.contract.getSellQuote(token, parseEther(amountIn));
      return {
        amountOut: result[0],
        fee: result[1]
      };
    } catch (error) {
      throw new Error(`Failed to get sell quote: ${error}`);
    }
  }

  /**
   * Buy tokens from the bonding curve
   * @param params Buy token parameters
   * @param options Transaction options
   * @returns Transaction response
   */
  async buyToken(
    params: BuyTokenParams,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for buy transactions');
    }

    try {
      const txOptions: any = {
        value: params.value ? parseEther(params.value) : parseEther(params.amountIn),
        gasLimit: options?.gasLimit || 500000 // Default gas limit of 500k
      };

      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.buyToken(
        params.token,
        parseEther(params.amountIn),
        parseEther(params.amountOutMin),
        params.to,
        txOptions
      );
    } catch (error) {
      throw new Error(`Failed to buy token: ${error}`);
    }
  }

  /**
   * Sell tokens to the bonding curve
   * @param params Sell token parameters
   * @param options Transaction options
   * @returns Transaction response
   */
  async sellToken(
    params: SellTokenParams,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for sell transactions');
    }

    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 500000 // Default gas limit of 500k
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.sellToken(
        params.token,
        parseEther(params.amountIn),
        parseEther(params.amountOutMin),
        params.to,
        txOptions
      );
    } catch (error) {
      throw new Error(`Failed to sell token: ${error}`);
    }
  }

  async approveToken(token: string, amount: string, options?: TransactionOptions): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for approving tokens');
    }
    
    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 500000 // Default gas limit of 500k
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      const erc20Contract = new Contract(token, ERC20_ABI, this.signer);
      const deployerAddress = await this.contract.getAddress();
      console.log('Approving tokens for deployer at:', deployerAddress);
      
      return await erc20Contract.approve(deployerAddress, parseEther(amount), txOptions);
      
    } catch (error) {
      throw new Error(`Failed to approve token: ${error}`);
    }
  }

  /**
   * Claim accumulated fees for a token
   * @param token Token address
   * @param options Transaction options
   * @returns Transaction response
   */
  async claimFee(
    token: string,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for claiming fees');
    }

    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 500000 // Default gas limit of 500k
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.claimFee(token, txOptions);
    } catch (error) {
      throw new Error(`Failed to claim fee: ${error}`);
    }
  }

  /**
   * Launch a new token
   * @param params Token launch parameters
   * @param options Transaction options
   * @returns Transaction response
   */
  async launchToken(
    params: LaunchTokenParams,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for launching tokens');
    }

    try {
      const config = this.buildTokenDeploymentConfig(params);
      
      const txOptions: any = {
        gasLimit: options?.gasLimit || 2000000 // Higher default gas limit of 2M for token launch
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.launchToken(config, txOptions);
    } catch (error) {
      throw new Error(`Failed to launch token: ${error}`);
    }
  }

  /**
   * Check if a base token is whitelisted
   * @param token Token address
   * @returns Whether the token is whitelisted
   */
  async isBaseTokenWhitelisted(token: string): Promise<boolean> {
    try {
      return await this.contract.isBaseTokenWhitelisted(token);
    } catch (error) {
      throw new Error(`Failed to check if base token is whitelisted: ${error}`);
    }
  }

  /**
   * Get the contract owner
   * @returns Owner address
   */
  async getOwner(): Promise<string> {
    try {
      return await this.contract.owner();
    } catch (error) {
      throw new Error(`Failed to get owner: ${error}`);
    }
  }

  /**
   * Wait for a transaction to be mined and return the receipt
   * @param tx Transaction response
   * @returns Transaction receipt
   */
  async waitForTransaction(tx: ContractTransactionResponse) {
    return await tx.wait();
  }

  /**
   * Get the launched token address from a transaction receipt
   * @param receipt Transaction receipt
   * @returns Token address if found
   */
  getTokenAddressFromReceipt(receipt: any): string | null {
    if (!receipt || !receipt.logs) return null;

    for (const log of receipt.logs) {
      try {
        const parsed = this.contract.interface.parseLog(log);
        if (parsed && parsed.name === 'TokenLaunched') {
          return parsed.args.token;
        }
      } catch (error) {
        // Skip non-matching logs
      }
    }
    return null;
  }

  /**
   * Build token deployment configuration from parameters
   * @param params Launch token parameters
   * @returns Token deployment config
   */
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
      appIdentifier: '', // Will be set by the contract
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
      surgeFeeStartingTime: Math.floor(Date.now() / 1000).toString(), // Current timestamp
      surgeFeeDuration: params.surgeFeeDuration,
      maxSurgeFeeBps: params.maxSurgeFeeBps
    };
  }

  /**
   * Utility function to convert wei to ether
   * @param wei Wei amount
   * @returns Ether amount as string
   */
  static formatEther(wei: BigNumberish): string {
    return formatEther(wei);
  }

  /**
   * Utility function to convert ether to wei
   * @param ether Ether amount
   * @returns Wei amount
   */
  static parseEther(ether: string): bigint {
    return parseEther(ether);
  }

  /**
   * Graduate a token from bonding curve to Uniswap V4
   * @param token Token address
   * @param allowPreGraduation Whether to allow graduation before bonding curve is depleted
   * @param options Transaction options
   * @returns Transaction response
   */
  async graduateToken(
    token: string,
    allowPreGraduation: boolean = false,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for graduating tokens');
    }

    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 1000000 // Default gas limit of 1M for graduation
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.graduateToken(token, allowPreGraduation, txOptions);
    } catch (error) {
      throw new Error(`Failed to graduate token: ${error}`);
    }
  }
} 