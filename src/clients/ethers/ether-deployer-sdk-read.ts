import {
  ethers,
  formatEther,
  parseEther,
  BigNumberish,
  formatUnits,
} from "ethers";
import {
  BuyQuote,
  SellQuote,
  AutoGraduationParams,
  PoolKey,
  TokenDeploymentConfig,
  TokenState,
  FeeSplit,
  FeeBreakdown,
  FeeResponse,
} from "../../types";
import { CONTRACTS } from "../../config";
import { DEPLOYER_ABI } from "../../abis/deployer-abi";
import { STATEMANAGER_ABI } from "../../abis/statemanager-abi";
import type { EthersSDKConfig } from "./types";
import { LP_LOCKER_ABI } from "../../abis/lp-locker-abi";

export class DeployerReader {
  protected contract: ethers.Contract;
  protected stateManagerContract: ethers.Contract;
  protected lpLockerContract: ethers.Contract;
  protected provider: ethers.Provider;

  constructor(config: EthersSDKConfig) {
    if (!config.rpcUrl) throw new Error("RPC URL is required");

    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts)
      throw new Error(`Unsupported network: ${config.network}`);

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    this.contract = new ethers.Contract(
      networkContracts.DEPLOYER_ADDRESS,
      DEPLOYER_ABI,
      this.provider
    );
    this.stateManagerContract = new ethers.Contract(
      networkContracts.STATE_MANAGER_ADDRESS,
      STATEMANAGER_ABI,
      this.provider
    );
    this.lpLockerContract = new ethers.Contract(
      networkContracts.LP_LOCKER_ADDRESS,
      LP_LOCKER_ABI,
      this.provider
    );
  }

  async getBuyQuote(token: string, amountIn: string): Promise<BuyQuote> {
    try {
      await this.contract.buyQuote.estimateGas(token, parseEther(amountIn), {
        from: null,
      });
    } catch (error) {
      const decodedError = this.contract.interface.decodeErrorResult(
        "QuoteAmount",
        (error as { data: string }).data
      );
      return {
        amountOut: decodedError.amountOut,
        amountInUsed: decodedError.effectiveAmountIn,
      };
    }
    throw new Error("buy quote did not throw");
  }

  async getSellQuote(token: string, amountIn: string): Promise<SellQuote> {
    try {
      await this.contract.sellQuote.estimateGas(token, parseEther(amountIn), {
        from: null,
      });
    } catch (error) {
      const decodedError = this.contract.interface.decodeErrorResult(
        "QuoteAmount",
        (error as { data: string }).data
      );
      return {
        amountOut: decodedError.amountOut,
        amountInUsed: decodedError.effectiveAmountIn,
      };
    }
    throw new Error("sell quote did not throw");
  }

  async getTokenPrice(token: string): Promise<number> {
    return Number(await this.contract.getTokenPrice(token)) / 10 ** 36;
  }

  async getPredictedTokenAddress(
    owner: `0x${string}`,
    salt: `0x${string}`
  ): Promise<{
    addr: `0x${string}`;
    exists: boolean;
  }> {
    const [addr, exists] = await this.contract.predictTokenAddress(owner, salt);
    return { addr, exists };
  }

  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }

  async isBaseTokenWhitelisted(token: string): Promise<boolean> {
    return await this.contract.isBaseTokenWhitelisted(token);
  }

  async getTokenState(token: string): Promise<TokenState> {
    const result = await this.stateManagerContract.getTokenState(token);
    const [
      tokensInBondingCurve,
      baseTokensInBondingCurve,
      lastPrice,
      totalFees,
      isGraduated,
      poolAddress,
    ] = result;
    return {
      tokensInBondingCurve: BigInt(tokensInBondingCurve),
      baseTokensInBondingCurve: BigInt(baseTokensInBondingCurve),
      lastPrice: BigInt(lastPrice),
      totalFees: BigInt(totalFees),
      isGraduated,
      poolAddress: poolAddress as `0x${string}`, // Ensure this is a valid address format
    };
  }

  async getProtocolFeeShare(): Promise<number> {
    return Number(await this.stateManagerContract.PROTOCOL_FEE_SHARE());
  }

  async getBondingCurveFeeAccumulated(token: string): Promise<string> {
    return formatEther(
      await this.stateManagerContract.bondingCurveFeeAccumulated(token)
    );
  }

  async getComputerUnclamiedFee(token: string): Promise<string> {
    return await this.lpLockerContract.computeUnclaimedFees(token);
  }

  async getAutoGraduationParams(token: string): Promise<AutoGraduationParams> {
    const result =
      await this.stateManagerContract.getAutoGraduationParams(token);
    return {
      tickSpacing: Number(result[0]),
      startingTick: Number(result[1]),
      endTick: Number(result[2]),
      targetTick: Number(result[3]),
      poolFee: Number(result[4]),
    };
  }

  async getBaseToken(token: string): Promise<string> {
    return await this.stateManagerContract.getBaseToken(token);
  }

  async getPoolKey(token: string): Promise<PoolKey> {
    const result = await this.stateManagerContract.getPoolKey(token);
    return {
      token0: result.currency0 as `0x${string}`, // Ensure this is a valid address format
      token1: result.currency1 as `0x${string}`, // Ensure this is a valid address format
      tickSpacing: Number(result.tickSpacing),
      fee: Number(result.fee),
    };
  }

  async getSurgeFee(config: TokenDeploymentConfig): Promise<string> {
    return formatEther(await this.stateManagerContract.getSurgeFee(config));
  }

  async getTokenDeploymentConfig(
    token: string
  ): Promise<TokenDeploymentConfig> {
    const result =
      await this.stateManagerContract.getTokenDeploymentConfig(token);
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

  async getTokenSupply(token: string): Promise<string> {
    return formatEther(await this.stateManagerContract.getTokenSupply(token));
  }

  async isGraduated(token: string): Promise<boolean> {
    return await this.stateManagerContract.isGraduated(token);
  }

  async getProtocolFeeRecipient(): Promise<string> {
    return await this.stateManagerContract.protocolFeeRecipient();
  }

  async getPoolFeeSplits(token: string): Promise<FeeSplit[]> {
    const splits = await this.stateManagerContract.poolFeeSplits(token);
    return splits.map((split: any) => ({
      recipient: split.recipient,
      bps: split.bps,
    }));
  }

  async getFees(token: string): Promise<FeeResponse> {
    const [configResult, bondingResult, unclaimedResult] =
      await Promise.allSettled([
        this.getTokenDeploymentConfig(token),
        this.stateManagerContract.bondingCurveFeeAccumulated(token),
        this.lpLockerContract.computeUnclaimedFees(token),
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

    // TODO: Throw except if contract reverts
    const computeUnclaimedFee =
      unclaimedResult.status === "fulfilled"
        ? (unclaimedResult.value as [bigint, bigint])
        : ([0n, 0n] as [bigint, bigint]);

    if (errors.length) {
      throw new Error(errors.join("\n"));
    }

    let baseTokenDecimals = 18;
    if (config!.baseToken !== "0x0000000000000000000000000000000000000000") {
      // Create ERC20 contract instance to get decimals
      const erc20Contract = new ethers.Contract(
        config!.baseToken,
        ["function decimals() view returns (uint8)"],
        this.provider
      );
      baseTokenDecimals = await erc20Contract.decimals();
    }

    const tokenFeeShare: Record<string, FeeBreakdown> = {};
    const bondingCurveFeeShare: Record<
      string,
      {
        baseFee: bigint;
        tokenFee: bigint;
      }
    > = {};
    const poolFeeShares: Record<
      string,
      {
        uniswapBaseFee: bigint;
        uniswapTokenFee: bigint;
      }
    > = {};

    const bondingFee = BigInt(bondingCurveFeeAccumulated!);
    const [uniswapBaseFee, uniswapTokenFee] = computeUnclaimedFee;

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
            poolFeeShares[recipient].uniswapBaseFee,
          baseTokenDecimals
        ),
        tokenFeeShare: formatEther(
          bondingCurveFeeShare[recipient].tokenFee +
            poolFeeShares[recipient].uniswapTokenFee
        ),
        bondingCurveBaseTokenFee: formatUnits(
          bondingCurveFeeShare[recipient].baseFee,
          baseTokenDecimals
        ),
        uniswapBaseTokenFee: formatEther(
          poolFeeShares[recipient].uniswapBaseFee
        ),
        uniswapTokenFee: formatEther(poolFeeShares[recipient].uniswapTokenFee),
      };
    }

    return {
      tokenFeeShare,
      bondingCurveFeeAccumulated: {
        baseFee: formatEther(bondingFee),
        tokenFee: "0", // Currently our contract doesn't accumulate fees in token, only in base token
      },
      lpFeeAccumulated: {
        baseFee: formatEther(computeUnclaimedFee[0]),
        tokenFee: formatEther(computeUnclaimedFee[1]),
      },
    };
  }

  async getPositionManager(): Promise<string> {
    return await this.stateManagerContract.positionManager();
  }

  async getStateView(): Promise<string> {
    return await this.stateManagerContract.stateView();
  }

  async getTokenIdRecipient(): Promise<string> {
    return await this.stateManagerContract.tokenIdRecipient();
  }

  async getTokenDeploymentConfigsMapping(
    token: string
  ): Promise<TokenDeploymentConfig> {
    return await this.getTokenDeploymentConfig(token);
  }

  async getTokenStatesMapping(token: string): Promise<TokenState> {
    return await this.getTokenState(token);
  }

  static formatEther(wei: BigNumberish): string {
    return formatEther(wei);
  }

  static parseEther(ether: string): bigint {
    return parseEther(ether);
  }
}
