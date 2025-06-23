import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { useDeployerSDK } from "../src";
import { waitForTransactionReceipt } from "viem/actions";

const deployerContractAddress = "0x8e095febb45a3c852e81599fa9e155be83b67e2c";
const amountETHToUseForBuy1 = "0.0000001";
const amountTokensToSell = "770";
const amountETHToUseForBuy2 = "0.000001";
const protocolFeeRecipient = "0x1234567890123456789012345678901234567890";
const testTokenAddress = "0x03DDCF4ab7bF145bCf221bE21c52c6b10C2A6BC5";

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
}

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const publicKey = account.address;

export default function TokenDeployer() {
  const randomNumber = Math.floor(Math.random() * 10000);

  const { sdk, isLoading, error } = useDeployerSDK({
    client: "viem",
    network: "base-sepolia",
    rpcUrl: "https://sepolia.base.org",
    walletClient,
  });

  const [status, setStatus] = useState("");

  if (isLoading) return <p>Loading SDK...</p>;
  if (error) return <p>Error loading SDK: {error.message}</p>;

  const handleDeploy = async () => {
    if (!sdk) return;

    try {
      setStatus("Checking whitelist...");
      const isWhitelisted = await sdk.read.isBaseTokenWhitelisted(
        "0x0000000000000000000000000000000000000000"
      );
      console.log("ETH is whitelisted:", isWhitelisted);

      setStatus("Launching token...");
      const launchTx = await sdk.write.launchToken({
        name: `TT_${randomNumber}`,
        symbol: `TTK_${randomNumber}`,
        image: "https://example.com/image.png",
        creator: publicKey,
        baseToken: "0x0000000000000000000000000000000000000000",
        teamSupply: "1000000000000000000000000",
        totalSupply: "10000000000000000000000000",
        bondingCurveSupply: "5000000000000000000000",
        liquidityPoolSupply: "995000000000000000000000",
        bondingCurveBuyFee: "250",
        bondingCurveSellFee: "250",
        bondingCurveFeeSplits: [
          { recipient: publicKey, bps: BigInt(9500) },
          { recipient: protocolFeeRecipient, bps: BigInt(500) },
        ],
        bondingCurveParams: {
          prices: [
            "110000000",
            "120000000",
            "130000000",
            "140000000",
            "150000000",
            "160000000",
            "170000000",
            "180000000",
            "190000000",
            "200000000",
          ],
          numSteps: "10",
          stepSize: "500000000000000000000",
        },
        allowForcedGraduation: false,
        graduationFeeBps: "0",
        graduationFeeSplits: [],
        poolFees: 3000,
        poolFeeSplits: [
          { recipient: publicKey, bps: BigInt(9500) },
          { recipient: protocolFeeRecipient, bps: BigInt(500) },
        ],
        surgeFeeDuration: "900",
        maxSurgeFeeBps: "1000",
      });
      console.log("Launch transaction hash:", launchTx.hash);

      setStatus("Getting buy quote...");
      const buyQuote = await sdk.read.getBuyQuote(
        testTokenAddress,
        amountETHToUseForBuy1
      );
      console.log("Buy Quote:", buyQuote);

      setStatus("Buying tokens...");
      const buyTx = await sdk.write.buyToken({
        token: testTokenAddress,
        amountIn: amountETHToUseForBuy1,
        amountOutMin: "0",
        to: publicKey,
        value: amountETHToUseForBuy1,
      });
      console.log("Buy transaction hash:", buyTx.transactionHash);
      const receipt = await waitForTransactionReceipt(walletClient, {
        hash: buyTx.transactionHash,
      });
      console.log("Buy transaction receipt:", receipt);

      setStatus("Getting sell quote...");
      const sellQuote = await sdk.read.getSellQuote(
        testTokenAddress,
        amountTokensToSell
      );
      console.log("Sell Quote:", sellQuote);

      setStatus("Selling tokens...");
      const sellTx = await sdk.write.approveAndSell({
        token: testTokenAddress,
        amountIn: amountTokensToSell,
        amountOutMin: "0",
        to: publicKey,
      });
      console.log("Sell transaction hash:", sellTx.hash);

      setStatus("Claiming fees...");
      const claimTx = await sdk.write.claimFee(testTokenAddress);
      console.log("Claim transaction hash:", claimTx.hash);

      setStatus("Buying more tokens...");
      const buyQuote2 = await sdk.read.getBuyQuote(
        testTokenAddress,
        amountETHToUseForBuy2
      );
      console.log("Buy Quote:", buyQuote2);

      const buyTx2 = await sdk.write.buyToken({
        token: testTokenAddress,
        amountIn: amountETHToUseForBuy2,
        amountOutMin: "0",
        to: publicKey,
        value: amountETHToUseForBuy2,
      });
      console.log("Buy transaction hash:", buyTx2.transactionHash);

      setStatus("Graduating token...");
      const graduateTx = await sdk.write.graduateToken(testTokenAddress, true);
      console.log("Graduate transaction hash:", graduateTx.hash);

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
