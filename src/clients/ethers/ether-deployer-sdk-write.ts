import {
  Contract,
  ContractTransactionResponse,
  ethers,
  parseEther,
} from "ethers";

import { DEPLOYER_ABI } from "../../abis/deployer-abi";
import { CONTRACTS } from "../../config";
import {
  Address,
  BuyTokenParams,
  LaunchTokenParams,
  SellTokenParams,
  SwapTokenResult,
  TokenDeploymentConfig,
  TransactionOptions,
} from "../../types";
import { extractEventArgument, generateSalt } from "../../utils/helper";
import {
  ensureProtocolFee,
  validateFeeSplitArray,
  validateLaunchTokenBondingCurveParams,
  validateSalt,
} from "../../utils/validators";
import type { EthersSDKConfig } from "./types";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
];

export class DeployerWriter {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(config: EthersSDKConfig) {
    if (!config.rpcUrl) throw new Error("RPC URL is required");

    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts)
      throw new Error(`Unsupported network: ${config.network}`);

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    } else if (config.signer) {
      this.signer = config.signer;
    }

    const signerOrProvider = this.signer || this.provider;

    this.contract = new ethers.Contract(
      networkContracts.DEPLOYER_ADDRESS,
      DEPLOYER_ABI,
      signerOrProvider
    );
  }

  /**
   * Buy a token by sending base tokens to the bonding curve
   * @param params Parameters including token address, input amount, minimum output amount, and recipient
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async buyToken(
    params: BuyTokenParams,
    options?: TransactionOptions
  ): Promise<SwapTokenResult> {
    if (!this.signer)
      throw new Error("Signer is required for buy transactions");

    const value = params.value
      ? parseEther(params.value)
      : parseEther(params.amountIn);

    const txOverrides: any = {
      value,
    };
    if (options?.gasPrice) txOverrides.gasPrice = options.gasPrice;

    // Estimate gas
    const estimatedGas = await this.contract.buyToken.estimateGas(
      params.token,
      parseEther(params.amountIn),
      parseEther(params.amountOutMin),
      params.to,
      txOverrides
    );

    const gasLimit = options?.gasLimit || (estimatedGas * 12n) / 10n; // +20%

    const tx = await this.contract.buyToken(
      params.token,
      parseEther(params.amountIn),
      parseEther(params.amountOutMin),
      params.to,
      {
        ...txOverrides,
        gasLimit,
      }
    );

    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error(`Transaction failed: ${receipt.transactionHash}`);
    }

    console.log("Buy transaction confirmed:", receipt.transactionHash);
    return {
      success: receipt.status === 1,
      transactionHash: receipt.hash,
      receipt: receipt,
    };
  }

  /**
   * Sell tokens from the bonding curve
   * @param params Parameters including token address, input amount, minimum output amount, and recipient
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async sellToken(
    params: SellTokenParams,
    options?: TransactionOptions
  ): Promise<SwapTokenResult> {
    if (!this.signer)
      throw new Error("Signer is required for sell transactions");

    const txOverrides: any = {};
    if (options?.gasPrice) txOverrides.gasPrice = options.gasPrice;

    // Estimate gas
    const estimatedGas = await this.contract.sellToken.estimateGas(
      params.token,
      parseEther(params.amountIn),
      parseEther(params.amountOutMin),
      params.to,
      txOverrides
    );

    const gasLimit = options?.gasLimit || (estimatedGas * 12n) / 10n; // +20% buffer

    const sellTx = await this.contract.sellToken(
      params.token,
      parseEther(params.amountIn),
      parseEther(params.amountOutMin),
      params.to,
      {
        ...txOverrides,
        gasLimit,
      }
    );

    const receipt = await sellTx.wait();

    if (receipt.status !== 1) {
      throw new Error(`Transaction failed: ${receipt.transactionHash}`);
    }

    console.log("Sell transaction confirmed:", receipt.transactionHash);
    return {
      success: receipt.status,
      transactionHash: receipt.hash,
      receipt: receipt,
    };
  }

  /**
   * Approve the deployer contract to spend a specific token on the user's behalf
   * @param token ERC20 token address
   * @param amount Amount to approve
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async approveToken(
    token: string,
    amount: string,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer)
      throw new Error("Signer is required for approving tokens");

    const txOptions: any = {
      gasLimit: options?.gasLimit || 500000,
    };
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

    const erc20Contract = new Contract(token, ERC20_ABI, this.signer);
    const deployerAddress = await this.contract.getAddress();

    return await erc20Contract.approve(
      deployerAddress,
      parseEther(amount),
      txOptions
    );
  }

  /**
   * Approve the deployer contract to spend tokens and then sell them in a single flow
   * @param params Parameters including token address, input amount, minimum output amount, and recipient
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Sell transaction response
   */
  async approveAndSell(
    params: SellTokenParams,
    options?: TransactionOptions
  ): Promise<SwapTokenResult> {
    if (!this.signer)
      throw new Error("Signer is required for approve and sell transactions");

    // Step 1: Approve the token
    console.log("Approving token...");
    const approvalTx = await this.approveToken(
      params.token,
      params.amountIn,
      options
    );
    console.log("Approval transaction sent. Waiting for confirmation...");
    await approvalTx.wait();
    console.log("Token approved successfully.");

    // Step 2: Sell the token
    console.log("Selling token...");
    const sellTx = await this.sellToken(params, options);
    console.log("Sell transaction sent.");

    return sellTx;
  }

  /**
   * Claim accumulated bonding curve fees for a specific token
   * @param token Token address
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async claimFee(
    token: string,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) throw new Error("Signer is required for claiming fees");

    const txOptions: any = {
      gasLimit: options?.gasLimit || 700000,
    };
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

    return await this.contract.claimFee(token, txOptions);
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
  async launchToken(
    params: LaunchTokenParams,
    salt?: string,
    options?: TransactionOptions
  ): Promise<{ tx: ContractTransactionResponse; createdTokenAddress: string }> {
    if (!this.signer)
      throw new Error("Signer is required for launching tokens");

    // Adjust fee splits to ensure protocol fee is included
    params.bondingCurveFeeSplits = ensureProtocolFee(
      params.bondingCurveFeeSplits
    );
    params.poolFeeSplits = ensureProtocolFee(params.poolFeeSplits);
    params.graduationFeeSplits = ensureProtocolFee(params.graduationFeeSplits);

    // Validate after injecting protocol fee
    validateLaunchTokenBondingCurveParams(params);
    validateFeeSplitArray(
      params.bondingCurveFeeSplits,
      "bondingCurveFeeSplits"
    );
    validateFeeSplitArray(params.poolFeeSplits, "poolFeeSplits");
    validateFeeSplitArray(params.graduationFeeSplits, "graduationFeeSplits");

    const config = this.buildTokenDeploymentConfig(params);
    const finalSalt = salt ?? generateSalt();
    validateSalt(finalSalt);

    const txOverrides: any = {};
    if (options?.gasPrice) txOverrides.gasPrice = options.gasPrice;

    let gasLimit: bigint = 7_000_000n;
    try {
      const estimatedGas = await this.contract.launchToken.estimateGas(
        config,
        finalSalt,
        txOverrides
      );
      gasLimit = (estimatedGas * 12n) / 10n;
    } catch (err) {
      console.warn(
        "Gas estimation for launchToken failed. Using fallback gasLimit.",
        err
      );
    }

    const tx = await this.contract.launchToken(config, finalSalt, {
      ...txOverrides,
      gasLimit,
    });

    const receipt = await tx.wait();

    const createdTokenAddress = extractEventArgument({
      logs: receipt.logs,
      eventName: "TokenLaunched",
      argumentName: "token",
    });

    if (!createdTokenAddress) {
      throw new Error("TokenLaunched event not found");
    }

    return { tx, createdTokenAddress };
  }

  /**
   * Graduate a token from the bonding curve (can allow forced graduation)
   * @param token Token address
   * @param allowPreGraduation Allow forced graduation if true
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async graduateToken(
    token: string,
    allowPreGraduation: boolean = false,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer)
      throw new Error("Signer is required for graduating tokens");

    const txOverrides: any = {};
    if (options?.gasPrice) txOverrides.gasPrice = options.gasPrice;

    // Estimate gas
    let gasLimit: bigint = 1_000_000n;
    try {
      const estimatedGas = await this.contract.graduateToken.estimateGas(
        token,
        allowPreGraduation,
        txOverrides
      );
      gasLimit = (estimatedGas * 12n) / 10n; // +20% buffer
    } catch (err) {
      console.warn(
        "Gas estimation for graduateToken failed. Using fallback gasLimit.",
        err
      );
    }

    return await this.contract.graduateToken(token, allowPreGraduation, {
      ...txOverrides,
      gasLimit,
    });
  }

  /**
   * Set the whitelist status of a base token
   * @param token Token address
   * @param whitelisted Boolean flag to whitelist (true) or remove from whitelist (false)
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async setBaseTokenWhitelist(
    token: string,
    whitelisted: boolean,
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer)
      throw new Error("Signer is required for setting base token whitelist");

    const txOptions: any = {
      gasLimit: options?.gasLimit || 500000,
    };
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

    return await this.contract.setBaseTokenWhitelist(
      token,
      whitelisted,
      txOptions
    );
  }

  /**
   * Relinquish control of the state manager to the protocol
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async relinquishStateManager(
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer)
      throw new Error("Signer is required to relinquish state manager");

    const txOptions: any = {
      gasLimit: options?.gasLimit || 500000,
    };
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

    return await this.contract.relinquishStateManager(txOptions);
  }

  /**
   * Withdraw residual (dust) base tokens from the contract
   * @param options Optional transaction parameters like gas limit and gas price
   * @returns Transaction response
   */
  async withdrawDust(
    options?: TransactionOptions
  ): Promise<ContractTransactionResponse> {
    if (!this.signer) throw new Error("Signer is required to withdraw dust");

    const txOptions: any = {
      gasLimit: options?.gasLimit || 500000,
    };
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;

    return await this.contract.withdrawDust(txOptions);
  }

  async waitForTransaction(
    txHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) throw new Error("Provider is not initialized");

    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      return receipt;
    } catch (error) {
      console.error("Error waiting for transaction receipt:", error);
      throw error;
    }
  }

  private buildTokenDeploymentConfig(
    params: LaunchTokenParams
  ): TokenDeploymentConfig {
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
      appIdentifier: "",
      teamSupply: BigInt(params.teamSupply),
      vestingStartTime: params.vestingStartTime
        ? BigInt(params.vestingStartTime)
        : BigInt(0),
      vestingDuration: params.vestingDuration
        ? BigInt(params.vestingDuration)
        : BigInt(0),
      vestingWallet: params.vestingWallet
        ? (params.vestingWallet as Address)
        : (ethers.ZeroAddress as Address),
      bondingCurveSupply: BigInt(params.bondingCurveSupply),
      liquidityPoolSupply: BigInt(params.liquidityPoolSupply),
      totalSupply: BigInt(totalSupply),
      bondingCurveBuyFee: BigInt(params.bondingCurveBuyFee),
      bondingCurveSellFee: BigInt(params.bondingCurveSellFee),
      bondingCurveFeeSplits: params.bondingCurveFeeSplits.map((split) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      bondingCurveParams: {
        prices: params.bondingCurveParams.prices.map((price) => BigInt(price)),
        numSteps: BigInt(params.bondingCurveParams.numSteps),
        stepSize: BigInt(params.bondingCurveParams.stepSize),
      },
      allowForcedGraduation: params.allowForcedGraduation,
      allowAutoGraduation: params.allowAutoGraduation,
      graduationFeeBps: BigInt(params.graduationFeeBps),
      graduationFeeSplits: params.graduationFeeSplits.map((split) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      poolFees: params.poolFees,
      poolFeeSplits: params.poolFeeSplits.map((split) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      surgeFeeStartingTime: BigInt(Math.floor(Date.now() / 1000)),
      surgeFeeDuration: BigInt(params.surgeFeeDuration),
      maxSurgeFeeBps: BigInt(params.maxSurgeFeeBps),
    };
  }
}
