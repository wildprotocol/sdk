import { Address } from "viem";

export interface FeeSplit {
  bps: number;
  recipient: string;
}

export interface BondingCurveParams {
  prices: number[]; // Use `bigint[]` if you want full precision
  numSteps: number;
  stepSize: number;
}

export interface TokenConfig {
  name: string;
  image: string;
  symbol: string;
  creator: string;
  poolFees: number;
  baseToken: string;
  teamSupply: number;
  totalSupply: number;
  appIdentifier: string;
  poolFeeSplits: FeeSplit[];
  vestingWallet: string;
  maxSurgeFeeBps: number;
  vestingDuration: number;
  graduationFeeBps: number;
  surgeFeeDuration: number;
  vestingStartTime: number;
  bondingCurveBuyFee: number;
  bondingCurveParams: BondingCurveParams;
  bondingCurveSupply: number;
  allowAutoGraduation: boolean;
  bondingCurveSellFee: number;
  graduationFeeSplits: FeeSplit[];
  liquidityPoolSupply: number;
  surgeFeeStartingTime: number;
  allowForcedGraduation: boolean;
  bondingCurveFeeSplits: FeeSplit[];
}

export interface TokenData {
  chain_id: number;
  token: Address;
  block_number: number;
  block_timestamp: number;
  log_index: number;
  transaction_hash: string;
  app_id: string;
  config: TokenConfig;
}
