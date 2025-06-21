import { BigNumberish } from 'ethers';

export interface FeeSplit {
  recipient: string;
  bps: BigNumberish;
}

export interface PriceCurve {
  prices: BigNumberish[];
  numSteps: BigNumberish;
  stepSize: BigNumberish;
}

export interface TokenDeploymentConfig {
  creator: `0x${string}` | string; // address of the creator
  baseToken: `0x${string}` | string; // address of the creator`;
  name: string;
  symbol: string;
  image: string;
  appIdentifier: string;
  teamSupply: BigNumberish;
  vestingStartTime: BigNumberish;
  vestingDuration: BigNumberish;
  vestingWallet: string;
  bondingCurveSupply: BigNumberish;
  liquidityPoolSupply: BigNumberish;
  totalSupply: BigNumberish;
  bondingCurveBuyFee: BigNumberish;
  bondingCurveSellFee: BigNumberish;
  bondingCurveFeeSplits: FeeSplit[];
  bondingCurveParams: PriceCurve;
  allowForcedGraduation: boolean;
  graduationFeeBps: BigNumberish;
  graduationFeeSplits: FeeSplit[];
  poolFees: number | BigNumberish; // in basis points
  poolFeeSplits: FeeSplit[];
  surgeFeeStartingTime: BigNumberish;
  surgeFeeDuration: BigNumberish;
  maxSurgeFeeBps: BigNumberish;
}

export interface BuyQuote {
  amountOut: BigNumberish;
  amountInUsed: BigNumberish;
}

export interface SellQuote {
  amountOut: BigNumberish;
  amountInUsed: BigNumberish;
}

export interface SDKConfig {
  rpcUrl: string;
  signer?: any;         // For ethers
  walletClient?: any;   // For viem
  privateKey?: string;
  client: 'ethers' | 'viem';
}

export interface TransactionOptions {
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}

export interface LaunchTokenParams {
  name: string;
  symbol: string;
  image: string;
  creator: string;
  baseToken: string;
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
  allowForcedGraduation: boolean;
  graduationFeeBps: string;
  graduationFeeSplits: FeeSplit[];
  poolFees: number;
  poolFeeSplits: FeeSplit[];
  surgeFeeDuration: string;
  maxSurgeFeeBps: string;
  vestingStartTime?: string;
  vestingDuration?: string;
  vestingWallet?: string;
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
  fee: number;    // pool fee in basis points
};

export type TokenState = {
  tokensInBondingCurve: bigint;
  baseTokensInBondingCurve: bigint;
  lastPrice: bigint;
  totalFees: bigint;
  graduated: boolean;
  poolAddress: `0x${string}`; // address of the pool
};