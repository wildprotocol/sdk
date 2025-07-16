import {
  createPublicClient,
  http,
  parseEther,
  formatEther,
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionName,
  ContractFunctionArgs,
  formatUnits,
} from "viem";

import {
  BuyQuote,
  SellQuote,
  AutoGraduationParams,
  PoolKey,
  TokenDeploymentConfig,
  TokenState,
  FeeSplit,
  Address,
  FeeBreakdown,
  FeeResponse,
} from "../../types";
import { DEPLOYER_ABI } from "../../abis/deployer-abi";
import { CONTRACTS } from "../../config";
import { STATEMANAGER_ABI } from "../../abis/statemanager-abi";
import type { ViemSDKConfig } from "./types";
import { LP_LOCKER_ABI } from "../../abis/lp-locker-abi";

export class ViemDeployerReader {
  protected publicClient: ReturnType<typeof createPublicClient>;
  protected deployerAddress: Address;
  protected stateManagerAddress: Address;
  protected lpLockerAddress: Address;

  constructor(config: ViemSDKConfig) {
    if (!config.rpcUrl) throw new Error("RPC URL is required");

    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts)
      throw new Error(`Unsupported network: ${config.network}`);

    this.publicClient = createPublicClient({
      transport: http(config.rpcUrl),
    });

    this.deployerAddress = networkContracts.DEPLOYER_ADDRESS as Address;
    this.stateManagerAddress =
      networkContracts.STATE_MANAGER_ADDRESS as Address;
    this.lpLockerAddress = networkContracts.LP_LOCKER_ADDRESS as Address;
  }

  private async callDeployer<
    functionName extends ContractFunctionName<
      typeof DEPLOYER_ABI,
      "pure" | "view"
    >,
    const args extends ContractFunctionArgs<
      typeof DEPLOYER_ABI,
      "pure" | "view",
      functionName
    >,
  >(functionName: functionName, args: args): Promise<any> {
    return await this.publicClient.readContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: functionName,
      args: args,
    });
  }

  private async callStateManager<
    functionName extends ContractFunctionName<
      typeof STATEMANAGER_ABI,
      "pure" | "view"
    >,
    const args extends ContractFunctionArgs<
      typeof STATEMANAGER_ABI,
      "pure" | "view",
      functionName
    >,
  >(functionName: functionName, args: args): Promise<any> {
    return await this.publicClient.readContract({
      address: this.stateManagerAddress,
      abi: STATEMANAGER_ABI,
      functionName: functionName,
      args: args,
    });
  }

  private async callLpLocker<
    functionName extends ContractFunctionName<
      typeof LP_LOCKER_ABI,
      "pure" | "view"
    >,
    const args extends ContractFunctionArgs<
      typeof LP_LOCKER_ABI,
      "pure" | "view",
      functionName
    >,
  >(functionName: functionName, args: args): Promise<any> {
    return await this.publicClient.readContract({
      address: this.lpLockerAddress,
      abi: LP_LOCKER_ABI,
      functionName: functionName,
      args: args,
    });
  }

  async getBuyQuote(token: string, amountIn: string): Promise<BuyQuote> {
    try {
      // This call should always revert, which is expected in this quote system
      await this.publicClient.simulateContract({
        address: this.deployerAddress,
        account: this.deployerAddress,
        abi: DEPLOYER_ABI,
        functionName: "buyQuote",
        args: [token as `0x${string}`, parseEther(amountIn)],
      });

      // If no revert happened, it's an error in the flow
      throw new Error("buy quote did not throw as expected");
    } catch (error: any) {
      if (error instanceof BaseError) {
        const revertError = error.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );

        if (
          revertError instanceof ContractFunctionRevertedError &&
          revertError.data?.args
        ) {
          const [amountOut, effectiveAmountIn] = revertError.data.args as [
            bigint,
            bigint,
          ];

          return {
            amountOut,
            amountInUsed: effectiveAmountIn,
          };
        }
      }

      console.error("Unexpected error:", error);
      throw new Error("buy quote did not throw as expected");
    }
  }

  async getSellQuote(token: string, amountIn: string): Promise<SellQuote> {
    try {
      // This call should always revert to return the quote data
      await this.publicClient.simulateContract({
        address: this.deployerAddress,
        account: this.deployerAddress,
        abi: DEPLOYER_ABI,
        functionName: "sellQuote",
        args: [token as `0x${string}`, parseEther(amountIn)],
      });

      // If no revert happened, it's an error in the flow
      throw new Error("sell quote did not throw as expected");
    } catch (error: any) {
      if (error instanceof BaseError) {
        const revertError = error.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );

        if (
          revertError instanceof ContractFunctionRevertedError &&
          revertError.data?.args
        ) {
          const [amountOut, effectiveAmountIn] = revertError.data.args as [
            bigint,
            bigint,
          ];

          return {
            amountOut,
            amountInUsed: effectiveAmountIn,
          };
        }
      }

      console.error("Unexpected error:", error);
      throw new Error("sell quote did not throw as expected");
    }
  }

  async getTokenPrice(token: Address): Promise<number> {
    return Number(await this.callDeployer("getTokenPrice", [token])) / 10 ** 36;
  }

  async getPredictedTokenAddress(
    owner: `0x${string}`,
    salt: `0x${string}`
  ): Promise<{
    addr: string;
    exists: boolean;
  }> {
    const [addr, exists] = await this.callDeployer("predictTokenAddress", [
      owner,
      salt,
    ]);
    return { addr, exists };
  }

  async getOwner(): Promise<string> {
    return await this.callDeployer("owner", []);
  }

  async isBaseTokenWhitelisted(token: Address): Promise<boolean> {
    return await this.callDeployer("isBaseTokenWhitelisted", [token]);
  }

  async getTokenState(token: Address): Promise<TokenState> {
    const result = await this.callStateManager("getTokenState", [token]);

    return {
      tokensInBondingCurve: BigInt(result.tokensInBondingCurve),
      baseTokensInBondingCurve: BigInt(result.baseTokensInBondingCurve),
      // lastPrice: result.lastPrice ? BigInt(result.lastPrice) : 0n, // in your log, 'lastPrice' was missing, so provide fallback
      // totalFees: result.totalFees ? BigInt(result.totalFees) : 0n, // same here
      isGraduated: result.isGraduated, // your ABI returns 'isGraduated' not 'graduated'
      poolAddress: result.poolAddress,
    };
  }

  async getProtocolFeeShare(): Promise<number> {
    return Number(await this.callStateManager("PROTOCOL_FEE_SHARE", []));
  }

  async getBondingCurveFeeAccumulated(token: Address): Promise<string> {
    const result = await this.callStateManager("bondingCurveFeeAccumulated", [
      token,
    ]);
    return formatEther(result);
  }
  async getComputeUnclamiedFee(token: Address): Promise<string> {
    const result = await this.callLpLocker("computeUnclaimedFees", [token]);
    return formatEther(result);
  }

  async getAutoGraduationParams(token: Address): Promise<AutoGraduationParams> {
    const result = await this.callStateManager("getAutoGraduationParams", [
      token,
    ]);

    return {
      tickSpacing: Number(result[0]),
      startingTick: Number(result[1]),
      endTick: Number(result[2]),
      targetTick: Number(result[3]),
      poolFee: Number(result[4]),
    };
  }

  async getBaseToken(token: Address): Promise<string> {
    return await this.callStateManager("getBaseToken", [token]);
  }

  async getPoolKey(token: Address): Promise<PoolKey> {
    const result = await this.callStateManager("getPoolKey", [token]);

    return {
      token0: result.currency0,
      token1: result.currency1,
      tickSpacing: Number(result.tickSpacing),
      fee: Number(result.fee),
    };
  }

  async getSurgeFee(config: TokenDeploymentConfig): Promise<string> {
    const result = await this.callStateManager("getSurgeFee", [config]);
    return formatEther(result);
  }

  async getTokenDeploymentConfig(
    token: Address
  ): Promise<TokenDeploymentConfig> {
    const result = await this.callStateManager("getTokenDeploymentConfig", [
      token,
    ]);

    return {
      creator: result.creator,
      baseToken: result.baseToken,
      name: result.name,
      symbol: result.symbol,
      image: result.image,
      teamSupply: result.teamSupply.toString(),
      bondingCurveSupply: result.bondingCurveSupply.toString(),
      liquidityPoolSupply: result.liquidityPoolSupply.toString(),
      totalSupply: result.totalSupply.toString(),
      bondingCurveBuyFee: result.bondingCurveBuyFee,
      bondingCurveSellFee: result.bondingCurveSellFee,
      allowAutoGraduation: result.allowAutoGraduation,
      allowForcedGraduation: result.allowForcedGraduation,
      graduationFeeBps: result.graduationFeeBps,
      poolFees: result.poolFees,
      surgeFeeStartingTime: result.surgeFeeStartingTime.toString(),
      surgeFeeDuration: result.surgeFeeDuration.toString(),
      maxSurgeFeeBps: result.maxSurgeFeeBps,
      bondingCurveFeeSplits: result.bondingCurveFeeSplits.map((split: any) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      graduationFeeSplits: result.graduationFeeSplits.map((split: any) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      poolFeeSplits: result.poolFeeSplits.map((split: any) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      bondingCurveParams: result.bondingCurveParams,
      vestingStartTime: result.vestingStartTime?.toString() || "0",
      vestingDuration: result.vestingDuration?.toString() || "0",
      vestingWallet: result.vestingWallet,
      appIdentifier: result.appIdentifier || "",
    };
  }

  async getTokenSupply(token: Address): Promise<string> {
    const result = await this.callStateManager("getTokenSupply", [token]);
    return formatEther(result);
  }

  async isGraduated(token: Address): Promise<boolean> {
    return await this.callStateManager("isGraduated", [token]);
  }

  async getProtocolFeeRecipient(): Promise<string> {
    return await this.callStateManager("protocolFeeRecipient", []);
  }

  async getPoolFeeSplits(token: Address): Promise<FeeSplit[]> {
    const splits = await this.callStateManager("poolFeeSplits", [token]);

    return splits.map((split: any) => ({
      recipient: split.recipient,
      bps: split.bps,
    }));
  }

  async getFees(token: Address): Promise<FeeResponse> {
    const [configResult, bondingResult, unclaimedResult] =
      await Promise.allSettled([
        this.getTokenDeploymentConfig(token),
        this.callStateManager("bondingCurveFeeAccumulated", [token]),
        this.callLpLocker("computeUnclaimedFees", [token]),
      ]);

    const errors: string[] = [];

    const config =
      configResult.status === "fulfilled"
        ? configResult.value
        : (errors.push("token config fetch failed"), undefined);

    const bondingCurveFeeAccumulated =
      bondingResult.status === "fulfilled"
        ? bondingResult.value
        : (errors.push("bondingCurveFeeAccumulated failed"), undefined);

    const computeUnclaimedFee =
      unclaimedResult.status === "fulfilled"
        ? (unclaimedResult.value as [bigint, bigint])
        : ([0n, 0n] as [bigint, bigint]);

    if (errors.length) {
      throw new Error(errors.join("\n"));
    }

    // Get base token decimals
    let baseTokenDecimals = 18;
    if (config!.baseToken !== "0x0000000000000000000000000000000000000000") {
      baseTokenDecimals = await this.publicClient.readContract({
        address: config!.baseToken,
        abi: [
          {
            name: "decimals",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint8" }],
          },
        ],
        functionName: "decimals",
      });
    }

    const bondingFee = BigInt(bondingCurveFeeAccumulated);
    const [uniswapBaseFee, uniswapTokenFee] = computeUnclaimedFee;

    const bondingCurveFeeShare: Record<
      string,
      { baseFee: bigint; tokenFee: bigint }
    > = {};
    const poolFeeShares: Record<
      string,
      { uniswapBaseFee: bigint; uniswapTokenFee: bigint }
    > = {};
    const tokenFeeShare: Record<string, FeeBreakdown> = {};

    for (const { recipient, bps } of config!.bondingCurveFeeSplits) {
      bondingCurveFeeShare[recipient] = {
        baseFee: (bondingFee * bps) / 10_000n,
        tokenFee: 0n,
      };
    }

    for (const { recipient, bps } of config!.poolFeeSplits) {
      poolFeeShares[recipient] = {
        uniswapBaseFee: (uniswapBaseFee * bps) / 10_000n,
        uniswapTokenFee: (uniswapTokenFee * bps) / 10_000n,
      };
    }

    for (const recipient in bondingCurveFeeShare) {
      tokenFeeShare[recipient] = {
        baseTokenFeeShare: formatUnits(
          bondingCurveFeeShare[recipient].baseFee +
            (poolFeeShares[recipient]?.uniswapBaseFee || 0n),
          baseTokenDecimals
        ),
        tokenFeeShare: formatEther(
          bondingCurveFeeShare[recipient].tokenFee +
            (poolFeeShares[recipient]?.uniswapTokenFee || 0n)
        ),
        bondingCurveBaseTokenFee: formatUnits(
          bondingCurveFeeShare[recipient].baseFee,
          baseTokenDecimals
        ),
        uniswapBaseTokenFee: formatEther(
          poolFeeShares[recipient]?.uniswapBaseFee || 0n
        ),
        uniswapTokenFee: formatEther(
          poolFeeShares[recipient]?.uniswapTokenFee || 0n
        ),
      };
    }

    return {
      tokenFeeShare,
      bondingCurveFeeAccumulated: {
        baseFee: formatEther(bondingFee),
        tokenFee: "0", // Currently our contract doesn't accumulate fees in token, only in base token
      },
      lpFeeAccumulated: {
        baseFee: formatEther(uniswapBaseFee),
        tokenFee: formatEther(uniswapTokenFee),
      },
    };
  }

  async getPositionManager(): Promise<string> {
    return await this.callStateManager("positionManager", []);
  }

  async getStateView(): Promise<string> {
    return await this.callStateManager("stateView", []);
  }

  async getTokenIdRecipient(): Promise<string> {
    return await this.callStateManager("tokenIdRecipient", []);
  }

  async getTokenDeploymentConfigsMapping(
    token: Address
  ): Promise<TokenDeploymentConfig> {
    return await this.getTokenDeploymentConfig(token);
  }

  async getTokenStatesMapping(token: Address): Promise<TokenState> {
    return await this.getTokenState(token);
  }
}
