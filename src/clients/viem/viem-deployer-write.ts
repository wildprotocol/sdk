import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

import { DEPLOYER_ABI } from "../../abis/v3/deployer-abi";
import { CONTRACTS } from "../../config";
import {
  Address,
  BuyTokenParams,
  LaunchTokenParams,
  SellTokenParams,
  TransactionOptions,
} from "../../types";

import type { WalletClient } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { extractEventArgument } from "../../utils/helper";
import { processLaunchTokenParams } from "../../utils/validators";
import type { ViemSDKConfig } from "./types";

export class ViemDeployerWriter {
  protected config: ViemSDKConfig;
  protected publicClient: ReturnType<typeof createPublicClient>;
  protected walletClient: WalletClient;
  protected deployerAddress: string;
  protected stateManagerAddress: string;

  constructor(config: ViemSDKConfig) {
    this.config = config;

    if (!config.rpcUrl) throw new Error("RPC URL is required");
    const networkContracts = CONTRACTS[config.version][config.network];
    if (!networkContracts)
      throw new Error(`Unsupported network: ${config.network}`);

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
        chain: config.network === "base-sepolia" ? baseSepolia : base,
      });
    } else {
      throw new Error(
        "Wallet Client or Private Key is required for write operations"
      );
    }
  }

  private buildTxOptions(options?: TransactionOptions) {
    const txOptions: any = {};
    if (options?.gasLimit) txOptions.gasLimit = options.gasLimit;
    if (options?.gasPrice) txOptions.gasPrice = options.gasPrice;
    return txOptions;
  }

  async buyToken(params: BuyTokenParams, options?: TransactionOptions) {
    const args = [
      params.token as Address,
      parseEther(params.amountIn),
      parseEther(params.amountOutMin),
      params.to as Address,
    ];

    const value = parseEther(params.value || params.amountIn);
    const overrides = {
      value,
      ...this.buildTxOptions(options),
    };

    let gasPrice: bigint | undefined;
    try {
      gasPrice = await this.publicClient.estimateGas({
        account: this.walletClient.account?.address as Address,
        address: this.deployerAddress,
        abi: DEPLOYER_ABI,
        functionName: "buyToken",
        args,
        ...overrides,
      });
      gasPrice = (gasPrice * 12n) / 10n; // +20% buffer
    } catch (err) {
      console.warn("Gas estimation failed, proceeding without it.", err);
      gasPrice = undefined; // allow `writeContract` to auto-estimate
    }

    const hash = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "buyToken",
      args,
      ...overrides,
      gasPrice,
    });

    const receipt = await waitForTransactionReceipt(this.publicClient, {
      hash,
    });

    return {
      hash,
      success: receipt.status,
      receipt,
    };
  }

  async sellToken(params: SellTokenParams, options?: TransactionOptions) {
    const args = [
      params.token as Address,
      parseEther(params.amountIn),
      parseEther(params.amountOutMin),
      params.to as Address,
    ];

    const txOverrides = {
      ...this.buildTxOptions(options),
    };

    let gasPrice: bigint | undefined;

    if (options?.gasPrice) {
      gasPrice = options.gasPrice;
    } else {
      try {
        gasPrice = await this.publicClient.estimateGas({
          account: this.walletClient.account?.address as Address,
          address: this.deployerAddress,
          abi: DEPLOYER_ABI,
          functionName: "sellToken",
          args,
          ...txOverrides,
        });

        gasPrice = (gasPrice * 12n) / 10n; // +20% buffer
      } catch (err) {
        console.warn(
          "Gas estimation failed for sellToken. Using fallback.",
          err
        );
        gasPrice = undefined; // let writeContract handle it
      }
    }

    const hash = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "sellToken",
      args,
      ...txOverrides,
      gasPrice,
    });

    const receipt = await waitForTransactionReceipt(this.publicClient, {
      hash,
    });

    return {
      hash,
      success: receipt.status === "success",
      receipt,
    };
  }

  async approveToken(
    token: string,
    amount: string,
    options?: TransactionOptions
  ) {
    const ERC20_ABI = [
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const;

    const tx = await this.walletClient.writeContract({
      address: token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [this.deployerAddress as `0x${string}`, parseEther(amount)],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async approveAndSell(params: SellTokenParams, options?: TransactionOptions) {
    await this.approveToken(params.token, params.amountIn, options);
    console.log("✅ Approval successful");

    const result = await this.sellToken(params, options);
    console.log("📤 Sell transaction sent:", result.hash);

    return {
      hash: result.hash,
      success: result.success,
      receipt: result.receipt,
    };
  }

  async claimFee(token: string, options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "claimFee",
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

  async launchToken(
    params: LaunchTokenParams,
    salt?: string,
    options?: TransactionOptions
  ) {
    const { config, salt: finalSalt } = processLaunchTokenParams(params, salt);

    const args = [config, finalSalt] as const;
    const txOverrides = this.buildTxOptions(options);

    let gasPrice: bigint | undefined;

    if (options?.gasPrice) {
      gasPrice = options.gasPrice;
    } else {
      try {
        gasPrice = await this.publicClient.estimateGas({
          account: this.walletClient.account?.address as Address,
          address: this.deployerAddress,
          abi: DEPLOYER_ABI,
          functionName: "launchToken",
          args,
          ...txOverrides,
        });

        gasPrice = (gasPrice * 12n) / 10n; // +20% buffer
      } catch (err) {
        console.warn(
          "Gas estimation failed for launchToken. Using fallback.",
          err
        );
        gasPrice = undefined;
      }
    }

    const hash = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "launchToken",
      args,
      ...txOverrides,
      gasPrice,
    });

    const receipt = await waitForTransactionReceipt(this.walletClient, {
      hash,
    });

    const createdTokenAddress = extractEventArgument({
      logs: receipt.logs,
      eventName: "TokenLaunched",
      argumentName: "token",
    });

    if (!createdTokenAddress) {
      throw new Error("TokenLaunched event not found");
    }

    return { tx: hash, createdTokenAddress };
  }

  async graduateToken(
    token: string,
    allowPreGraduation: boolean = false,
    options?: TransactionOptions
  ) {
    const args = [token as Address, allowPreGraduation];
    const txOverrides = this.buildTxOptions(options);

    let gasPrice: bigint | undefined;

    if (options?.gasPrice) {
      gasPrice = options.gasPrice;
    } else {
      try {
        gasPrice = await this.publicClient.estimateGas({
          account: this.walletClient.account?.address as Address,
          address: this.deployerAddress,
          abi: DEPLOYER_ABI,
          functionName: "graduateToken",
          args,
          ...txOverrides,
        });

        gasPrice = (gasPrice * 12n) / 10n; // +20% buffer
      } catch (err) {
        console.warn(
          "Gas estimation failed for graduateToken. Proceeding without explicit gas.",
          err
        );
        gasPrice = undefined;
      }
    }

    const hash = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "graduateToken",
      args,
      ...txOverrides,
      gasPrice,
    });

    const receipt = await waitForTransactionReceipt(this.publicClient, {
      hash,
    });

    return {
      success: receipt.status === "success",
      receipt,
    };
  }

  async setBaseTokenWhitelist(
    token: string,
    whitelisted: boolean,
    options?: TransactionOptions
  ) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "setBaseTokenWhitelist",
      args: [token as `0x${string}`, whitelisted],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async relinquishStateManager(options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "relinquishStateManager",
      args: [],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async withdrawDust(options?: TransactionOptions) {
    const tx = await this.walletClient.writeContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: "withdrawDust",
      args: [],
      ...this.buildTxOptions(options),
    });

    return tx;
  }

  async waitForTransaction(txHash: `0x${string}`) {
    try {
      const receipt = await waitForTransactionReceipt(this.publicClient, {
        hash: txHash,
      });
      return receipt;
    } catch (error) {
      console.error("Error waiting for transaction receipt:", error);
      throw error;
    }
  }
}
