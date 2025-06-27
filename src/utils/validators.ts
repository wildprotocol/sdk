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

export function adjustFeeSplits(
  existingSplits: FeeSplit[],
  protocolFeeBps: bigint
): FeeSplit[] {
  const remainingBps = 10_000n - protocolFeeBps;
  const totalBps = existingSplits.reduce(
    (sum, split) => sum + BigInt(split.bps),
    0n
  );

  if (totalBps === 0n) return [];

  return existingSplits.map((split) => {
    const adjustedBps = (BigInt(split.bps) * remainingBps) / totalBps;
    return {
      recipient: split.recipient as Address,
      bps: adjustedBps,
    };
  });
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
