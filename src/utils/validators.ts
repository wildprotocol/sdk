import { Address, FeeSplit, LaunchTokenParams } from '../types';

export function validateLaunchTokenParams(params: LaunchTokenParams): void {
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


export function adjustFeeSplits(existingSplits: FeeSplit[], protocolFeeBps: bigint): FeeSplit[] {
  const remainingBps = 10_000n - protocolFeeBps;
  const totalBps = existingSplits.reduce((sum, split) => sum + BigInt(split.bps), 0n);

  if (totalBps === 0n) return [];

  return existingSplits.map(split => {
    const adjustedBps = (BigInt(split.bps) * remainingBps) / totalBps;
    return {
      recipient: split.recipient as Address,
      bps: adjustedBps
    };
  });
}