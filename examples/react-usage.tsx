import React, { useState } from "react";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { Address } from "../src";
import { useDeployerSDK } from "../src/react/index";

const RECIPIENT = "0x0e3E591cdA42517D6DEd61D9DC3165AdDD179a8d";
const CREATOR = "0x0e3E591cdA42517D6DEd61D9DC3165AdDD179a8d";
const TEST_TOKEN_ADDRESS = "0x7a6fc57969035709a261c612dB698c29ca7B3DDb";

const privateKey = process.env.PRIVATE_KEY as Address;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
}

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http("https://mainnet.base.org"),
});

const publicKey = account.address;

export default function TokenDeployer() {
  const { sdk, isLoading, error } = useDeployerSDK({
    client: "viem",
    network: "base-mainnet",
    rpcUrl: "https://mainnet.base.org",
    walletClient,
    version: "v3",
  });

  const [status, setStatus] = useState("");

  if (isLoading) return <p>Loading SDK...</p>;
  if (error) return <p>Error loading SDK: {error.message}</p>;

  const handleDeploy = async () => {
    if (!sdk) return;

    try {
      setStatus("Checking whitelist...");
      const isWhitelisted = await sdk.read.isBaseTokenWhitelisted(
        "0x0000000000000000000000000000000000000000" // Base Token Address
      );
      console.log("ETH is whitelisted:", isWhitelisted);

      setStatus("Launching token...");
      const launchTx = await sdk.write.launchToken(tokenParams); // Launch the token
      console.log("✅ Token launched successfully!");
      console.log("Transaction hash:", launchTx.tx);
      console.log("Token address:", launchTx.createdTokenAddress);

      setStatus("Getting buy quote...");
      const buyQuote = await sdk.read.getBuyQuote(
        TEST_TOKEN_ADDRESS,
        "0.001" // Amount in ETH to buy
      );
      console.log("Buy Quote:", buyQuote);

      setStatus("Buying tokens...");
      const buyTx = await sdk.write.buyToken({
        token: TEST_TOKEN_ADDRESS,
        amountIn: "0.001", // Amount in ETH to buy,
        amountOutMin: "0",
        to: publicKey,
        value: "0.001", // Amount in ETH to buy,
      });
      console.log("Buy transaction hash:", buyTx.hash);
      console.log("Buy transaction hash receipt:", buyTx.receipt);

      setStatus("Getting sell quote...");
      const sellQuote = await sdk.read.getSellQuote(TEST_TOKEN_ADDRESS, "10");
      console.log("Sell Quote:", sellQuote);

      setStatus("Selling tokens...");
      const sellTx = await sdk.write.approveAndSell({
        token: TEST_TOKEN_ADDRESS,
        amountIn: "10",
        amountOutMin: "0",
        to: publicKey,
      });
      console.log("Sell transaction hash:", sellTx.hash);

      setStatus("Getting fees...");
      const feesTx = await sdk.read.getFees(TEST_TOKEN_ADDRESS);
      console.log("Fees transaction hash:", feesTx);

      setStatus("Claiming fees...");
      const claimTx = await sdk.write.claimFee(TEST_TOKEN_ADDRESS);
      console.log("Claim transaction hash:", claimTx);

      setStatus("Completed!");
    } catch (err) {
      console.error(err);
      setStatus("Error occurred, check console.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleDeploy}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Deploy Token & Run Flow
      </button>
      <p className="mt-4">{status}</p>
    </div>
  );
}

const stepCount = 5;
const totalBondingCurveTokens = 1_000_000n * 10n ** 18n;
const stepSize = (totalBondingCurveTokens / BigInt(stepCount)).toString();
const numSteps = stepCount.toString();
const prices = Array.from({ length: stepCount }, (_, i) =>
  (BigInt(i + 1) * 10n ** 24n).toString()
);

const tokenParams = {
  creator: CREATOR as Address,
  baseToken: "0x0000000000000000000000000000000000000000" as Address,
  name: "Alpha Token",
  symbol: "ALPT",
  image: "https://example.com/token.png",
  teamSupply: "100000000000000000000000",
  bondingCurveSupply: "1000000000000000000000000",
  liquidityPoolSupply: "1000000000000000000000000",
  totalSupply: "2100000000000000000000000",
  bondingCurveBuyFee: "100",
  bondingCurveSellFee: "100",
  allowForcedGraduation: false,
  graduationFeeBps: "100",
  poolFees: 20000,
  surgeFeeStartingTime: "1750410342",
  surgeFeeDuration: "86400",
  maxSurgeFeeBps: "1000",
  bondingCurveFeeSplits: [{ recipient: RECIPIENT as Address, bps: 1000n }],
  graduationFeeSplits: [
    { recipient: RECIPIENT as Address, bps: 9500n },
    {
      recipient: "0x136F342DBC00Dc105B23ecC40b1134830720f721" as Address,
      bps: 500n,
    },
  ],
  poolFeeSplits: [
    { recipient: RECIPIENT as Address, bps: 9500n },
    {
      recipient: "0x136F342DBC00Dc105B23ecC40b1134830720f721" as Address,
      bps: 500n,
    },
  ],
  bondingCurveParams: {
    prices,
    numSteps,
    stepSize,
  },
  vestingStartTime: "0",
  vestingDuration: "0",
  vestingWallet: "0x0000000000000000000000000000000000000000" as Address,
  appIdentifier: "AlphaTokenExample",
  protocolFeeBps: 500,
  allowAutoGraduation: true,
};
