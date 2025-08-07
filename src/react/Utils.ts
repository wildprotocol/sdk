import { parseUnits } from "viem";
import { TokenData } from "./types";

export function formatNumberMagnitude(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "T";
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  } else if (num < 0.001 && num !== 0) {
    return num.toFixed(5); // always 3 decimals
  }

  return num.toFixed(4).replace(/\.?0+$/, ""); // up to 3 decimals, trims .0/.00
}

export function calculateSlippage({
  actualQuote,
  inputEthAmount,
  referenceQuote,
  referenceEth = "1",
  tokenDecimals = 18,
}: {
  actualQuote: bigint;
  inputEthAmount: string; // in ETH (e.g., "0.1")
  referenceQuote: bigint;
  referenceEth?: string; // in ETH (default: "1")
  tokenDecimals?: number;
}): number {
  // Convert ETH to wei
  const inputEthInWei = parseUnits(inputEthAmount, tokenDecimals);
  const referenceEthInWei = parseUnits(referenceEth, tokenDecimals);

  // Calculate price per wei in token units (preserving precision)
  const actualPricePerWei =
    (actualQuote * 10n ** BigInt(tokenDecimals)) / inputEthInWei;

  const referencePricePerWei =
    (referenceQuote * 10n ** BigInt(tokenDecimals)) / referenceEthInWei;

  // Calculate slippage
  const slippage =
    (Number(referencePricePerWei - actualPricePerWei) /
      Number(referencePricePerWei)) *
    100;

  return slippage;
}

export const dummyEthOnBase: TokenData = {
  chain_id: 8453,
  token: "0x4200000000000000000000000000000000000006", // ETH on Base
  block_number: 12345678,
  block_timestamp: Math.floor(Date.now() / 1000),
  log_index: 0,
  transaction_hash:
    "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1",
  app_id: "base_eth_app",
  config: {
    name: "Ethereum",
    image:
      "https://www.citypng.com/public/uploads/preview/ethereum-eth-round-logo-icon-png-701751694969815akblwl2552.png",
    symbol: "ETH",
    creator: "0x0000000000000000000000000000000000000000",
    poolFees: 300,
    baseToken: "0x4200000000000000000000000000000000000006",
    teamSupply: 0,
    totalSupply: 1000000000000000000000000, // 1M ETH
    appIdentifier: "eth_base",
    poolFeeSplits: [
      { recipient: "0xabc...def", bps: 5000 },
      { recipient: "0x123...789", bps: 5000 },
    ],
    vestingWallet: "0x0000000000000000000000000000000000000000",
    maxSurgeFeeBps: 100,
    vestingDuration: 0,
    graduationFeeBps: 50,
    surgeFeeDuration: 0,
    vestingStartTime: 0,
    bondingCurveBuyFee: 10,
    bondingCurveParams: {
      numSteps: 100,
      stepSize: 100, // 1 ETH per step
      prices: [100], // 0.01 ETH
    },
    bondingCurveSupply: 0,
    allowAutoGraduation: false,
    bondingCurveSellFee: 100,
    graduationFeeSplits: [],
    liquidityPoolSupply: 0,
    surgeFeeStartingTime: 0,
    allowForcedGraduation: false,
    bondingCurveFeeSplits: [
      { recipient: "0xabc...def", bps: 7000 },
      { recipient: "0x123...789", bps: 3000 },
    ],
  },
};
