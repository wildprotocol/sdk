import { LaunchTokenParams } from '../types';

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
