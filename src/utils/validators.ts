import { isHexString } from "ethers";
import { Address, FeeSplit, LaunchTokenParams } from "../types";

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

export function ensureProtocolFee(splitArray: FeeSplit[]): FeeSplit[] {
  const protocolFeeRecipient =
    "0x136F342DBC00Dc105B23ecC40b1134830720f721" as Address;
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
