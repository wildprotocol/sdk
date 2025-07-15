import { isHexString } from "ethers";
import { Address, FeeSplit, LaunchTokenParams } from "../types";

export function validateLaunchTokenBondingCurveParams(
  params: LaunchTokenParams
): void {
  const { bondingCurveSupply, bondingCurveParams } = params;
  const { numSteps, stepSize, prices } = bondingCurveParams;

  try {
    const supply = BigInt(bondingCurveSupply);
    const steps = BigInt(numSteps);
    const expectedStepSize = supply / steps;

    if (BigInt(stepSize) !== expectedStepSize) {
      throw new Error(
        `Validation Error: stepSize (${stepSize}) must equal floor(bondingCurveSupply / numSteps) (${expectedStepSize}).`
      );
    }

    if (prices.length !== Number(numSteps)) {
      throw new Error(
        `Validation Error: The number of prices (${prices.length}) must equal numSteps (${numSteps}).`
      );
    }
  } catch (err) {
    throw new Error(
      `Validation Error: Failed to validate bonding curve params. Details: ${err}`
    );
  }
}

export function ensureProtocolFee(splitArray: FeeSplit[]): FeeSplit[] {
  const protocolFeeRecipient =
    "0x136F342DBC00Dc105B23ecC40b1134830720f721" as Address;

  const providedBps = splitArray.reduce((acc, split) => acc + split.bps, 0n);

  if (providedBps !== 10_000n) {
    throw new Error("Validation Error: The sum of bps must be 10,000.");
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
