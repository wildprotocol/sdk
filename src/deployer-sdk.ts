import { ethers, ContractTransactionResponse, parseEther, formatEther, BigNumberish } from 'ethers';
import { Contract } from 'ethers';
import { DEPLOYER_ABI } from './deployer-abi';
import { STATEMANAGER_ABI } from './statemanager-abi'
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
import { CONTRACTS, SupportedNetworks } from './config';
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export class DeployerSDK {
  private contract: ethers.Contract;
  private stateManagerContract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(config: SDKConfig & { network: SupportedNetworks }) {
    if (!config.rpcUrl) {
      throw new Error('RPC URL is required');
    }

    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts) {
      throw new Error(`Unsupported network: ${config.network}`);
    }

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    } else if (config.signer) {
      this.signer = config.signer;
    }

    const signerOrProvider = this.signer || this.provider;

    this.contract = new ethers.Contract(networkContracts.DEPLOYER_ADDRESS, DEPLOYER_ABI, signerOrProvider);
    this.stateManagerContract = new ethers.Contract(networkContracts.STATE_MANAGER_ADDRESS, STATEMANAGER_ABI, signerOrProvider);
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

  /**
   * Get the token state from the contract
   * @param token Token address
   * @returns Token state object
   */
  async getTokenState(token: string): Promise<any> {
    try {
      return await this.stateManagerContract.getTokenState(token);
    } catch (error) {
      throw new Error(`Failed to get token state: ${error}`);
    }
  }

  /**
   * Get the pending owner of the contract
   * @returns Pending owner address
   */
  async getPendingOwner(): Promise<string> {
    try {
      return await this.contract.pendingOwner();
    } catch (error) {
      throw new Error(`Failed to get pending owner: ${error}`);
    }
  }

  /**
   * Get the LP Locker contract address
   * @returns LP Locker address
   */
  async getLpLocker(): Promise<string> {
    try {
      return await this.contract.lplocker();
    } catch (error) {
      throw new Error(`Failed to get LP locker address: ${error}`);
    }
  }

  /**
   * Get the Permit2 contract address
   * @returns Permit2 address
   */
  async getPermit2(): Promise<string> {
    try {
      return await this.contract.permit2();
    } catch (error) {
      throw new Error(`Failed to get Permit2 address: ${error}`);
    }
  }

  /**
   * Get the Pool Manager contract address
   * @returns Pool Manager address
   */
  async getPoolManager(): Promise<string> {
    try {
      return await this.contract.poolManager();
    } catch (error) {
      throw new Error(`Failed to get Pool Manager address: ${error}`);
    }
  }

  /**
   * Get the State Manager contract address
   * @returns State Manager address
   */
  async getStateManager(): Promise<string> {
    try {
      return await this.contract.stateManager();
    } catch (error) {
      throw new Error(`Failed to get State Manager address: ${error}`);
    }
  }

  /**
   * Get the Universal Router contract address
   * @returns Universal Router address
   */
  async getUniversalRouter(): Promise<string> {
    try {
      return await this.contract.universalRouter();
    } catch (error) {
      throw new Error(`Failed to get Universal Router address: ${error}`);
    }
  }

  /**
   * Get the maximum fee receiver count
   * @returns Maximum fee receiver count
   */
  async getMaxFeeReceiverCount(): Promise<bigint> {
    try {
      return await this.contract.MAX_FEE_RECEIVER_COUNT();
    } catch (error) {
      throw new Error(`Failed to get max fee receiver count: ${error}`);
    }
  }

  /**
   * Get the minimum vesting start time
   * @returns Minimum vesting start time
   */
  async getMinVestingStartTime(): Promise<bigint> {
    try {
      return await this.contract.MIN_VESTING_START_TIME();
    } catch (error) {
      throw new Error(`Failed to get min vesting start time: ${error}`);
    }
  }

  /**
   * Check if a token is whitelisted in base tokens mapping
   * @param token Token address
   * @returns Whether the token is whitelisted
   */
  async getWhitelistedBaseToken(token: string): Promise<boolean> {
    try {
      return await this.contract.whitelistedBaseTokens(token);
    } catch (error) {
      throw new Error(`Failed to get whitelisted base token: ${error}`);
    }
  }

   /**
   * Set base token whitelist status
   * @param token Token address
   * @param whitelisted Whitelist status (true/false)
   * @param options Transaction options
   * @returns Transaction response
   */
   async setBaseTokenWhitelist(
    token: string,
    whitelisted: boolean,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for setting base token whitelist');
    }

    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 500000
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.setBaseTokenWhitelist(token, whitelisted, txOptions);
    } catch (error) {
      throw new Error(`Failed to set base token whitelist: ${error}`);
    }
  }

  /**
   * Relinquish the state manager role
   * @param options Transaction options
   * @returns Transaction response
   */
  async relinquishStateManager(options?: TransactionOptions): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required to relinquish state manager');
    }

    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 500000
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.relinquishStateManager(txOptions);
    } catch (error) {
      throw new Error(`Failed to relinquish state manager: ${error}`);
    }
  }

  /**
   * Withdraw dust (small remaining funds)
   * @param options Transaction options
   * @returns Transaction response
   */
  async withdrawDust(options?: TransactionOptions): Promise<ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required to withdraw dust');
    }

    try {
      const txOptions: any = {
        gasLimit: options?.gasLimit || 500000
      };
      if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

      return await this.contract.withdrawDust(txOptions);
    } catch (error) {
      throw new Error(`Failed to withdraw dust: ${error}`);
    }
  }

  /**
   * Get protocol fee share from StateManager
   * @returns Protocol fee share
   */
  async getProtocolFeeShare(): Promise<bigint> {
    try {
      return await this.stateManagerContract.PROTOCOL_FEE_SHARE();
    } catch (error) {
      throw new Error(`Failed to get protocol fee share: ${error}`);
    }
  }

  /**
   * Get bonding curve fee accumulated for a token
   * @param token Token address
   * @returns Bonding curve fee accumulated
   */
  async getBondingCurveFeeAccumulated(token: string): Promise<bigint> {
    try {
      return await this.stateManagerContract.bondingCurveFeeAccumulated(token);
    } catch (error) {
      throw new Error(`Failed to get bonding curve fee accumulated: ${error}`);
    }
  }

  /**
   * Get auto graduation parameters for a token
   * @param token Token address
   * @returns Auto graduation parameters
   */
  async getAutoGraduationParams(token: string): Promise<any> {
    try {
      return await this.stateManagerContract.getAutoGraduationParams(token);
    } catch (error) {
      throw new Error(`Failed to get auto graduation params: ${error}`);
    }
  }

  /**
   * Get base token of a token
   * @param token Token address
   * @returns Base token address
   */
  async getBaseToken(token: string): Promise<string> {
    try {
      return await this.stateManagerContract.getBaseToken(token);
    } catch (error) {
      throw new Error(`Failed to get base token: ${error}`);
    }
  }

  /**
   * Get pool key of a token
   * @param token Token address
   * @returns Pool key
   */
  async getPoolKey(token: string): Promise<any> {
    try {
      return await this.stateManagerContract.getPoolKey(token);
    } catch (error) {
      throw new Error(`Failed to get pool key: ${error}`);
    }
  }

  /**
   * Get surge fee based on token deployment config
   * @param config TokenDeploymentConfig
   * @returns Surge fee
   */
  async getSurgeFee(config: TokenDeploymentConfig): Promise<bigint> {
    try {
      return await this.stateManagerContract.getSurgeFee(config);
    } catch (error) {
      throw new Error(`Failed to get surge fee: ${error}`);
    }
  }

  /**
   * Get token deployment config
   * @param token Token address
   * @returns TokenDeploymentConfig
   */
  async getTokenDeploymentConfig(token: string): Promise<TokenDeploymentConfig> {
    try {
      return await this.stateManagerContract.getTokenDeploymentConfig(token);
    } catch (error) {
      throw new Error(`Failed to get token deployment config: ${error}`);
    }
  }

  /**
   * Get token supply
   * @param token Token address
   * @returns Token supply
   */
  async getTokenSupply(token: string): Promise<bigint> {
    try {
      return await this.stateManagerContract.getTokenSupply(token);
    } catch (error) {
      throw new Error(`Failed to get token supply: ${error}`);
    }
  }

  /**
   * Check if token is graduated
   * @param token Token address
   * @returns Graduation status
   */
  async isGraduated(token: string): Promise<boolean> {
    try {
      return await this.stateManagerContract.isGraduated(token);
    } catch (error) {
      throw new Error(`Failed to check graduation status: ${error}`);
    }
  }

  /**
   * Get protocol fee recipient address
   * @returns Protocol fee recipient address
   */
  async getProtocolFeeRecipient(): Promise<string> {
    try {
      return await this.stateManagerContract.protocolFeeRecipient();
    } catch (error) {
      throw new Error(`Failed to get protocol fee recipient: ${error}`);
    }
  }

  /**
   * Get pool fee splits for a token
   * @param token Token address
   * @returns Pool fee splits
   */
  async getPoolFeeSplits(token: string): Promise<any> {
    try {
      return await this.stateManagerContract.poolFeeSplits(token);
    } catch (error) {
      throw new Error(`Failed to get pool fee splits: ${error}`);
    }
  }

  /**
   * Get position manager address
   * @returns Position manager address
   */
  async getPositionManager(): Promise<string> {
    try {
      return await this.stateManagerContract.positionManager();
    } catch (error) {
      throw new Error(`Failed to get position manager: ${error}`);
    }
  }

  /**
   * Get state view address
   * @returns State view address
   */
  async getStateView(): Promise<string> {
    try {
      return await this.stateManagerContract.stateView();
    } catch (error) {
      throw new Error(`Failed to get state view: ${error}`);
    }
  }

  /**
   * Get token ID recipient address
   * @returns Token ID recipient address
   */
  async getTokenIdRecipient(): Promise<string> {
    try {
      return await this.stateManagerContract.tokenIdRecipient();
    } catch (error) {
      throw new Error(`Failed to get token ID recipient: ${error}`);
    }
  }

  /**
   * Get token deployment configs mapping value
   * @param token Token address
   * @returns Token deployment config
   */
  async getTokenDeploymentConfigsMapping(token: string): Promise<TokenDeploymentConfig> {
    try {
      return await this.stateManagerContract.tokenDeploymentConfigs(token);
    } catch (error) {
      throw new Error(`Failed to get token deployment configs mapping: ${error}`);
    }
  }

  /**
   * Get token states mapping value
   * @param token Token address
   * @returns Token state
   */
  async getTokenStatesMapping(token: string): Promise<any> {
    try {
      return await this.stateManagerContract.tokenStates(token);
    } catch (error) {
      throw new Error(`Failed to get token states mapping: ${error}`);
    }
  }


} 