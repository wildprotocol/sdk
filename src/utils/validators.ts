import { isHexString } from "ethers";
import { Address, FeeSplit, LaunchTokenParams, TokenDeploymentConfig } from "../types";
import { generateSalt } from "./helper";

export function validateLaunchTokenBondingCurveParams(
  params: LaunchTokenParams
): void {
  const { bondingCurveSupply, bondingCurveParams } = params;
  const { numSteps, stepSize, prices } = bondingCurveParams;

  const expectedSupply = BigInt(numSteps) * BigInt(stepSize);
  if (BigInt(bondingCurveSupply) !== expectedSupply) {
    throw new Error(
      `Validation Error: bondingCurveSupply (${bondingCurveSupply}) must equal numSteps * stepSize (${expectedSupply}).`
    );
  }

  if (prices.length !== Number(numSteps)) {
    throw new Error(
      `Validation Error: The number of prices (${prices.length}) must equal numSteps (${numSteps}).`
    );
  }
}

export function ensureProtocolFee(
  name: string,
  isFeeZero: boolean,
  splitArray: FeeSplit[]
): FeeSplit[] {
  const protocolFeeRecipient =
    "0x136F342DBC00Dc105B23ecC40b1134830720f721" as Address;

  // If there are no splits, return an empty array
  if (splitArray.length === 0 && isFeeZero) {
    return [];
  }
  const providedBps = splitArray.reduce((acc, split) => acc + split.bps, 0n);

  if (providedBps !== 10_000n) {
    throw new Error(`Validation Error: The sum of bps must be 10,000 for ${name}, got ${providedBps}.`);
  }

  const totalBps = 10_000n;
  const protocolFeeBps = 500n;

  const hasProtocolFee = splitArray.some(
    (split) =>
      split.recipient.toLowerCase() === protocolFeeRecipient.toLowerCase()
  );

  if (hasProtocolFee) return splitArray;

  const adjustedSplits = splitArray.map((split) => ({
    recipient: split.recipient,
    bps: (split.bps * (totalBps - protocolFeeBps)) / totalBps, // preserve total 10,000
  }));

  // Fix rounding loss by adjusting the first recipient
  const currentTotal = adjustedSplits.reduce(
    (acc, split) => acc + split.bps,
    0n
  );
  const remainder = totalBps - protocolFeeBps - currentTotal;

  if (adjustedSplits.length > 0) {
    adjustedSplits[0].bps += remainder;
  }

  return [
    ...adjustedSplits,
    {
      recipient: protocolFeeRecipient,
      bps: protocolFeeBps,
    },
  ];
}

export function validateFeeSplitArray(feeSplits: FeeSplit[], name: string) {
  const protocolFeeRecipient =
    "0x136F342DBC00Dc105B23ecC40b1134830720f721" as Address;

  if (feeSplits.length > 0) {
    const hasProtocolFee = feeSplits.some(
      (split) =>
        split.recipient.toLowerCase() === protocolFeeRecipient.toLowerCase()
    );

    if (!hasProtocolFee) {
      throw new Error(
        `${name} must include the protocol fee recipient (${protocolFeeRecipient}) with ${500} bps.`
      );
    }
  }
}

export function validateSalt(salt: string): void {
  if (!isHexString(salt, 32)) {
    throw new Error("Invalid salt: must be a 32-byte hex string (0x-prefixed)");
  }
}

export function processLaunchTokenParams(params: LaunchTokenParams, salt?: string): { config: TokenDeploymentConfig, salt: string } {
  params.bondingCurveFeeSplits = ensureProtocolFee(
    "bondingCurveFeeSplits",
    BigInt(params.bondingCurveBuyFee) === 0n &&
      BigInt(params.bondingCurveSellFee) === 0n,
    params.bondingCurveFeeSplits
  );
  params.poolFeeSplits = ensureProtocolFee(
    "poolFeeSplits",
    params.poolFees === 0,
    params.poolFeeSplits
  );
  params.graduationFeeSplits = ensureProtocolFee(
    "graduationFeeSplits",
    BigInt(params.graduationFeeBps) === 0n,
    params.graduationFeeSplits
  );
  validateLaunchTokenBondingCurveParams(params);
  validateFeeSplitArray(
    params.bondingCurveFeeSplits,
    "bondingCurveFeeSplits"
  );
  validateFeeSplitArray(params.poolFeeSplits, "poolFeeSplits");
  validateFeeSplitArray(params.graduationFeeSplits, "graduationFeeSplits");

  const config = buildTokenDeploymentConfig(params);
  const finalSalt = salt ?? generateSalt();
  validateSalt(finalSalt);
  return { config, salt: finalSalt };
}

export function buildTokenDeploymentConfig(
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
      ? params.vestingWallet
      : "0x0000000000000000000000000000000000000000",
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
    allowAutoGraduation: params.allowAutoGraduation,
    allowForcedGraduation: params.allowForcedGraduation,
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
};
