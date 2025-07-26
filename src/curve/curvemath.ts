import { BaseTokenConfig, PriceCurve } from "../types";
import {
  getTargetPriceAndHooksSimple,
  InvalidTokenAmount,
  minTokens,
  priceToSqrtPriceX96,
  StartTickTooHigh,
  StartTickTooLow,
  SubByTooLarge,
} from "./tickmath";
import { sqrt } from "./bigintmath";
import { SUPPORTED_BASE_TOKENS } from "../config";
import { parseUnits } from "../utils/parseUnits";
import { formatUnits } from "../utils/formatUnits";

export const MINTED_TOKEN_DECIMALS: bigint = 18n;
export const SCALE_EXPONENT: bigint = 36n; // MUST BE EVEN
export const SCALE_FACTOR: bigint = 10n ** SCALE_EXPONENT;
export const SCALE_FACTOR_SQRT: bigint = 10n ** (SCALE_EXPONENT / 2n);
export const DEFAULT_TICK_SPACING: bigint = 200n;

export enum CurveType {
  FLAT = "flat",
  LINEAR = "linear",
  QUADRATIC = "quadratic",
  CUBIC = "cubic",
  SQUARE_ROOT = "square_root",
}

export const initlaizeCurve = (
  curveType: CurveType,
  startPrice: bigint,
  endPrice: bigint,
  numSteps: bigint,
  approxBondingCurveSupply: bigint
): PriceCurve => {
  if (numSteps < 1n) {
    throw new Error("Num steps must be greater than 0");
  }

  const actualBondingCurveSupply =
    (approxBondingCurveSupply / numSteps) * numSteps;
  switch (curveType) {
    case CurveType.FLAT:
      if (startPrice !== endPrice || numSteps !== 1n) {
        throw new Error(
          "Flat curve must have startPrice === endPrice and numSteps === 1"
        );
      }
      return flatCurve(startPrice, actualBondingCurveSupply);
    case CurveType.LINEAR:
      return linearCurve(
        startPrice,
        endPrice,
        numSteps,
        actualBondingCurveSupply
      );
    case CurveType.QUADRATIC:
      return quadraticCurve(
        startPrice,
        endPrice,
        numSteps,
        actualBondingCurveSupply
      );
    case CurveType.CUBIC:
      return acceleratingPowerCurve(
        startPrice,
        endPrice,
        numSteps,
        actualBondingCurveSupply
      );
    case CurveType.SQUARE_ROOT:
      return sqrtCurve(
        startPrice,
        endPrice,
        numSteps,
        actualBondingCurveSupply
      );
    default:
      throw new Error("Invalid curve type");
  }
};

export const getBaseTokenDetails = (
  baseTokenChainId: number,
  baseTokenAddress: string
): BaseTokenConfig => {
  const baseToken = SUPPORTED_BASE_TOKENS.find(
    (token) =>
      token.chainId === baseTokenChainId && token.address === baseTokenAddress
  );
  if (!baseToken) {
    throw new Error("Base token not found");
  }
  return baseToken;
};

/**
 * Formats a base token string precise amount to a curve price entry.
 * @param baseTokenAmountFormattedString - The base token string amount
 * @param baseTokenChainId - The chain id of the base token
 * @param baseTokenAddress - The address of the base token
 * @returns The formatted curve price entry
 */
export const formatBaseTokenAmountForCurve = (
  baseTokenAmountFormattedString: string,
  baseTokenChainId: number,
  baseTokenAddress: string
): bigint => {
  const baseToken = getBaseTokenDetails(baseTokenChainId, baseTokenAddress);
  const decimals =
    SCALE_EXPONENT + BigInt(baseToken.decimals) - MINTED_TOKEN_DECIMALS;
  const baseTokenAmount = parseUnits(
    baseTokenAmountFormattedString,
    Number(decimals)
  );
  return baseTokenAmount;
};

/**
 * Formats a curve price entry to a base token amount. In string for precision
 * @param curvePrice - The price of the curve
 * @param baseTokenChainId - The chain id of the base token
 * @param baseTokenAddress - The address of the base token
 * @returns The formatted base token string amount
 */
export const formatCurveToBaseTokenStringAmount = (
  curvePrice: bigint,
  baseTokenChainId: number,
  baseTokenAddress: string
): string => {
  const baseToken = getBaseTokenDetails(baseTokenChainId, baseTokenAddress);
  const decimals =
    SCALE_EXPONENT + BigInt(baseToken.decimals) - MINTED_TOKEN_DECIMALS;
  return formatUnits(curvePrice, Number(decimals));
};

export function flatCurve(startPrice: bigint, totalSupply: bigint): PriceCurve {
  return {
    prices: [startPrice],
    numSteps: 1n,
    stepSize: totalSupply,
  };
}

export function linearCurve(
  startPrice: bigint,
  endPrice: bigint,
  numSteps: bigint,
  bondingCurveSupply: bigint
): PriceCurve {
  _validate(bondingCurveSupply, numSteps, startPrice, endPrice);

  const prices: bigint[] = [];
  const stepSize = bondingCurveSupply / numSteps;
  const diff = endPrice - startPrice;
  const denom = numSteps - 1n;
  const loMult = diff / denom;
  const hiMult = loMult + 1n;
  const hiCutoff = diff % denom;

  let currentPrice = startPrice;

  for (let i = 0n; i < numSteps; i++) {
    prices.push(currentPrice);
    if (i < hiCutoff) {
      currentPrice += hiMult;
    } else {
      currentPrice += loMult;
    }
  }
  // Self-asserts
  if (prices[0] !== startPrice) {
    throw new Error("Price curve does not start at startPrice");
  }
  if (prices[prices.length - 1] !== endPrice) {
    throw new Error("Price curve does not end at endPrice");
  }

  return {
    prices: prices,
    numSteps: numSteps,
    stepSize: stepSize,
  };
}

export function quadraticCurve(
  startPrice: bigint,
  endPrice: bigint,
  numSteps: bigint,
  bondingCurveSupply: bigint
): PriceCurve {
  _validate(bondingCurveSupply, numSteps, startPrice, endPrice);

  const prices: bigint[] = [];
  const diff = endPrice - startPrice;
  const denom = (numSteps - 1n) * (numSteps - 1n);

  let idx2 = 0n;
  for (let i = 0n; i < numSteps; i++) {
    prices.push(startPrice + (diff * idx2) / denom);
    idx2 += 2n * i + 1n;
  }

  // Self-asserts
  if (prices[0] !== startPrice) {
    throw new Error("Price curve does not start at startPrice");
  }
  if (prices[prices.length - 1] !== endPrice) {
    throw new Error("Price curve does not end at endPrice");
  }

  return {
    prices: prices,
    numSteps: numSteps,
    stepSize: bondingCurveSupply / numSteps,
  };
}

// Cubic curve
export function acceleratingPowerCurve(
  startPrice: bigint,
  endPrice: bigint,
  numSteps: bigint,
  bondingCurveSupply: bigint
): PriceCurve {
  _validate(bondingCurveSupply, numSteps, startPrice, endPrice);

  const prices: bigint[] = [];
  const diff = endPrice - startPrice;
  const denom = numSteps - 1n;
  const denom3 = denom * denom * denom;

  let i2 = 0n;
  let i3 = 0n;

  for (let i = 0n; i < numSteps; i++) {
    prices.push(startPrice + (diff * i3) / denom3);
    i3 += 3n * (i2 + i) + 1n;
    i2 += 2n * i + 1n;
  }

  // Self-asserts
  if (prices[0] !== startPrice) {
    throw new Error("Price curve does not start at startPrice");
  }
  if (prices[prices.length - 1] !== endPrice) {
    throw new Error("Price curve does not end at endPrice");
  }

  return {
    prices: prices,
    numSteps: numSteps,
    stepSize: bondingCurveSupply / numSteps,
  };
}

// Square root curve
export function sqrtCurve(
  startPrice: bigint,
  endPrice: bigint,
  numSteps: bigint,
  bondingCurveSupply: bigint
): PriceCurve {
  _validate(bondingCurveSupply, numSteps, startPrice, endPrice);

  const prices: bigint[] = [];
  const diff = endPrice - startPrice;
  for (let i = 0n; i < numSteps; i++) {
    prices.push(startPrice + sqrt((diff * diff * i) / numSteps));
  }
  prices[prices.length - 1] = endPrice;

  // Self-asserts
  if (prices[0] !== startPrice) {
    throw new Error("Price curve does not start at startPrice");
  }
  if (prices[prices.length - 1] !== endPrice) {
    throw new Error("Price curve does not end at endPrice");
  }

  return {
    prices: prices,
    numSteps: numSteps,
    stepSize: bondingCurveSupply / numSteps,
  };
}

export function customCurve(
  prices: bigint[],
  bondingCurveSupply: bigint
): PriceCurve {
  return {
    prices: prices,
    numSteps: BigInt(prices.length),
    stepSize: bondingCurveSupply / BigInt(prices.length),
  };
}

export function analyzeCurve(curve: PriceCurve): AnalyzeCurveResponse {
  const baseTokenAccumulatedPerStep = curve.prices.map(
    (price) => (price * curve.stepSize) / 10n ** 36n
  );
  const baseTokenAccumulated = baseTokenAccumulatedPerStep.reduce(
    (a, b) => a + b,
    0n
  );
  const minLiquidityPoolSupply = minTokens(
    offsetPriceToSqrtPriceX96(curve.prices[curve.prices.length - 1]),
    baseTokenAccumulated,
    DEFAULT_TICK_SPACING
  );
  return {
    bondingCurveSupply: curve.stepSize * curve.numSteps,
    baseTokenAccumulated: baseTokenAccumulated,
    minLiquidityPoolSupply: minLiquidityPoolSupply,
  };
}

export function analyzeCurveUntil(
  curve: PriceCurve,
  tokensConsumed: bigint
): bigint {
  let ethAccumulated = 0n;
  for (let i = 0n; i < curve.numSteps; i++) {
    if (curve.stepSize > tokensConsumed) {
      ethAccumulated += (curve.prices[Number(i)] * tokensConsumed) / 10n ** 36n;
      break;
    } else {
      ethAccumulated += (curve.prices[Number(i)] * curve.stepSize) / 10n ** 36n;
      tokensConsumed -= curve.stepSize;
    }
  }
  return ethAccumulated;
}

export class InvalidPriceCurveInput extends Error {
  constructor() {
    super(
      "Invalid price curve input: numSteps must be > 1, startPrice must be < endPrice, and bonding curve supply must be divisible by numSteps"
    );
    this.name = "InvalidPriceCurveInput";
  }
}

function _validate(
  bondingCurveSupply: bigint,
  numSteps: bigint,
  startPrice: bigint,
  endPrice: bigint
) {
  if (
    numSteps <= 1n ||
    startPrice >= endPrice ||
    bondingCurveSupply % numSteps !== 0n
  ) {
    throw new InvalidPriceCurveInput();
  }
}

export interface AnalyzeCurveResponse {
  bondingCurveSupply: bigint;
  baseTokenAccumulated: bigint;
  minLiquidityPoolSupply: bigint;
}

export const validateTokenGraduatable = (
  priceCurve: PriceCurve,
  graduationFeeBps: bigint,
  liquidityPoolSupply: bigint
) => {
  const tickSpacing = DEFAULT_TICK_SPACING;
  const priceOffseted = priceCurve.prices[priceCurve.prices.length - 1];
  const priceX96 = offsetPriceToSqrtPriceX96(priceOffseted);
  const curveAnalysis = analyzeCurve(priceCurve);

  const baseTokenAmount = curveAnalysis.baseTokenAccumulated;
  const baseTokenGraduationFee = (baseTokenAmount * graduationFeeBps) / 10000n;
  const baseTokenAfterFees = baseTokenAmount - baseTokenGraduationFee;

  try {
    // If this throws, the curve is not valid
    getTargetPriceAndHooksSimple(
      priceX96,
      liquidityPoolSupply,
      baseTokenAfterFees,
      tickSpacing
    );
  } catch (e) {
    if (
      e instanceof StartTickTooLow ||
      e instanceof InvalidTokenAmount ||
      e instanceof SubByTooLarge
    ) {
      throw new Error(
        "Please increase target price or increase liquidity pool supply"
      );
    }
    if (e instanceof StartTickTooHigh) {
      throw new Error(
        "Please decrease target price or increase bonding curve supply"
      );
    }
    throw e;
  }
};

export const offsetPriceToSqrtPriceX96 = (price: bigint): bigint => {
  return priceToSqrtPriceX96(price) / SCALE_FACTOR_SQRT;
};
