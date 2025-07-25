import { ContractTransactionReceipt } from "ethers";
import type { EthersSDKConfig } from "./clients/ethers/types";
import type { ViemSDKConfig } from "./clients/viem/types";

export type Address = `0x${string}`;

export interface FeeSplit {
  recipient: Address;
  bps: bigint;
}

export interface PriceCurve {
  prices: bigint[];
  numSteps: bigint;
  stepSize: bigint;
}

export interface TokenDeploymentConfig {
  creator: Address; // address of the creator
  baseToken: Address; // address of the creator`;
  name: string;
  symbol: string;
  image: string; // URL
  appIdentifier: string;
  teamSupply: bigint;
  vestingStartTime: bigint;
  vestingDuration: bigint;
  vestingWallet: Address;
  bondingCurveSupply: bigint;
  liquidityPoolSupply: bigint;
  totalSupply: bigint;
  bondingCurveBuyFee: bigint;
  bondingCurveSellFee: bigint;
  bondingCurveFeeSplits: FeeSplit[];
  bondingCurveParams: PriceCurve;
  allowAutoGraduation: boolean;
  allowForcedGraduation: boolean;
  graduationFeeBps: bigint;
  graduationFeeSplits: FeeSplit[];
  poolFees: number; // in basis points
  poolFeeSplits: FeeSplit[];
  surgeFeeStartingTime: bigint;
  surgeFeeDuration: bigint;
  maxSurgeFeeBps: bigint;
}

export interface BuyQuote {
  amountOut?: bigint;
  amountInUsed?: bigint;
}

export interface SellQuote {
  amountOut?: bigint;
  amountInUsed?: bigint;
}

export type SDKConfig =
  | (EthersSDKConfig & { client: "ethers" })
  | (ViemSDKConfig & { client: "viem" });

export interface TransactionOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  value?: bigint;
}

export interface LaunchTokenParams {
  name: string;
  symbol: string;
  image: string;
  creator: Address;
  baseToken: Address;
  totalSupply: string;
  teamSupply: string;
  bondingCurveSupply: string;
  liquidityPoolSupply: string;
  bondingCurveBuyFee: string;
  bondingCurveSellFee: string;
  bondingCurveFeeSplits: FeeSplit[];
  bondingCurveParams: {
    prices: string[];
    numSteps: string;
    stepSize: string;
  };
  allowAutoGraduation: boolean;
  allowForcedGraduation: boolean;
  graduationFeeBps: string;
  graduationFeeSplits: FeeSplit[];
  poolFees: number;
  poolFeeSplits: FeeSplit[];
  surgeFeeDuration: string;
  maxSurgeFeeBps: string;
  vestingStartTime?: string;
  vestingDuration?: string;
  vestingWallet?: Address;
  protocolFeeBps: number;
}

export interface BuyTokenParams {
  token: string;
  amountIn: string;
  amountOutMin: string;
  to: string;
  value?: string;
}

export interface SellTokenParams {
  token: string;
  amountIn: string;
  amountOutMin: string;
  to: string;
}

export type AutoGraduationParams = {
  tickSpacing: number;
  startingTick: number;
  endTick: number;
  targetTick: number;
  poolFee: number;
};

export type PoolKey = {
  token0: string; // address of token0
  token1: string; // address of token1
  fee: number; // pool fee in basis points
  tickSpacing: number; // tick spacing for the pool
};

export type TokenState = {
  tokensInBondingCurve: bigint;
  baseTokensInBondingCurve: bigint;
  lastPrice?: bigint;
  totalFees?: bigint;
  isGraduated: boolean;
  poolAddress: Address; // address of the pool
};

export type SwapTokenResult = {
  success: boolean;
  transactionHash: string;
  receipt: ContractTransactionReceipt;
};

/**
 * The breakdown of fees due to a specific recipient address.
 */
export type FeeBreakdown = {
  /**
   * Total amount of fee in base token (ETH/USDC etc) due to the address,
   * both before and after graduation.
   */
  baseTokenFeeShare: string;
  /**
   * Total amount of fee in the launched token due to the address,
   * both before and after graduation.
   */
  tokenFeeShare: string;
  /**
   * Base token fee accumulated before the token graduated.
   */
  bondingCurveBaseTokenFee: string;
  /**
   * Base token fee accumulated after the token graduated.
   */
  uniswapBaseTokenFee: string;
  /**
   * Launched token fee accumulated after the token graduated.
   */
  uniswapTokenFee: string;
};

/**
 * The response object containing fee information for a token.
 */
export type FeeResponse = {
  /**
   * The pay split by address to which the fee is due.
   * Keyed by recipient address.
   */
  tokenFeeShare: Record<string, FeeBreakdown>;
  /**
   * The sum total of fees due across all the fee recipient addresses,
   * accumulated before graduation.
   */
  bondingCurveFeeAccumulated: {
    baseFee: string;
    tokenFee: string;
  };
  /**
   * The sum total of fees due across all the fee recipient addresses,
   * accumulated after graduation (i.e., in the liquidity pool).
   */
  lpFeeAccumulated: {
    baseFee: string;
    tokenFee: string;
  };
};

export interface BaseTokenConfig {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  decimals: number;
}
