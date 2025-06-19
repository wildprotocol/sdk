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
  creator: string;
  baseToken: string;
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
  poolFees: number;
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
  rpcUrl?: string;
  privateKey?: string;
  signer?: any;
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
  teamSupply: string;
  bondingCurveSupply: string;
  liquidityPoolSupply: string;
  bondingCurveBuyFee: string;
  bondingCurveSellFee: string;
  bondingCurveFeeSplits: { recipient: string; bps: string }[];
  bondingCurveParams: {
    prices: string[];
    numSteps: string;
    stepSize: string;
  };
  allowForcedGraduation: boolean;
  graduationFeeBps: string;
  graduationFeeSplits: { recipient: string; bps: string }[];
  poolFees: number;
  poolFeeSplits: { recipient: string; bps: string }[];
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