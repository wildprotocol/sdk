// sdk-functions.ts
import { DeployerSDK } from './deployer-sdk';
import { sdkConfig } from './sdk-config';
import type {
  BuyQuote,
  SellQuote,
  BuyTokenParams,
  SellTokenParams,
  LaunchTokenParams,
  TransactionOptions
} from './types';
import { BigNumberish } from 'ethers';

// Automatically initialized SDK instance
const sdkInstance = new DeployerSDK(sdkConfig);

// All exposed functions
export async function getBuyQuote(token: string, amountIn: string): Promise<BuyQuote> {
  return await sdkInstance.getBuyQuote(token, amountIn);
}

export async function getSellQuote(token: string, amountIn: string): Promise<SellQuote> {
  return await sdkInstance.getSellQuote(token, amountIn);
}

export async function buyToken(params: BuyTokenParams, options?: TransactionOptions) {
  return await sdkInstance.buyToken(params, options);
}

export async function sellToken(params: SellTokenParams, options?: TransactionOptions) {
  return await sdkInstance.sellToken(params, options);
}

export async function approveToken(token: string, amount: string, options?: TransactionOptions) {
  return await sdkInstance.approveToken(token, amount, options);
}

export async function claimFee(token: string, options?: TransactionOptions) {
  return await sdkInstance.claimFee(token, options);
}

export async function launchToken(params: LaunchTokenParams, options?: TransactionOptions) {
  return await sdkInstance.launchToken(params, options);
}

export async function graduateToken(token: string, allowPreGraduation: boolean = false, options?: TransactionOptions) {
  return await sdkInstance.graduateToken(token, allowPreGraduation, options);
}

export async function isBaseTokenWhitelisted(token: string): Promise<boolean> {
  return await sdkInstance.isBaseTokenWhitelisted(token);
}

export async function getOwner(): Promise<string> {
  return await sdkInstance.getOwner();
}

export async function waitForTransaction(tx: any) {
  return await sdkInstance.waitForTransaction(tx);
}

export function getTokenAddressFromReceipt(receipt: any): string | null {
  return sdkInstance.getTokenAddressFromReceipt(receipt);
}

// Utility functions (can be imported directly)
export function formatEther(wei: BigNumberish): string {
  return DeployerSDK.formatEther(wei);
}

export function parseEther(ether: string): bigint {
  return DeployerSDK.parseEther(ether);
}
