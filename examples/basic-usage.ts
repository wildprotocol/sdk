import { ethers, Wallet } from "ethers";
import { Address, DeployerSDK } from "../src";

// Read private key from .env
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
}

const publicKey = new Wallet(privateKey).address;
console.log("Public key:", publicKey);

const rpcUrl = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new Wallet(privateKey, provider);

// Constant setup
const amountETHToUseForBuy1 = "0.0000001";
const amountTokensToSell = "770";
const amountETHToUseForBuy2 = "0.000001";
const protocolFeeRecipient = "0x1234567890123456789012345678901234567890";
const testTokenAddress = "0x03DDCF4ab7bF145bCf221bE21c52c6b10C2A6BC5";
const randomNumber = String(Math.floor(Math.random() * 10000));

async function main() {
  // Initialize the SDK
  const sdk = await DeployerSDK.getDeployer({
    client: "ethers",
    network: "base-mainnet",
    rpcUrl,
    signer,
  });

  try {
    // Check whitelist
    // base token must be whitelisted to launch a token with it
    const isWhitelisted = await sdk.read.isBaseTokenWhitelisted(
      "0x0000000000000000000000000000000000000000"
    );
    console.log("ETH is whitelisted:", isWhitelisted);

    // Launch token
    console.log("Launching new token...");
    const launchTx = await sdk.write.launchToken({
      name: "TT_" + randomNumber,
      symbol: "TTK_" + randomNumber,
      image: "https://example.com/image.png",
      creator: publicKey as Address,
      baseToken: "0x0000000000000000000000000000000000000000",
      teamSupply: "1000000000000000000000000",
      totalSupply: "10000000000000000000000000",
      bondingCurveSupply: "5000000000000000000000",
      liquidityPoolSupply: "995000000000000000000000",
      bondingCurveBuyFee: "250", // 2.5% (250 basis points)
      bondingCurveSellFee: "250", // 2.5%
      bondingCurveFeeSplits: [
        { recipient: publicKey as Address, bps: BigInt(9500) },
        { recipient: protocolFeeRecipient as Address, bps: BigInt(500) },
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
        { recipient: publicKey as Address, bps: BigInt(9500) },
        { recipient: protocolFeeRecipient, bps: BigInt(500) }, // this is the protocol fee recipient, Dont need to add this, it will be added automatically
      ],
      surgeFeeDuration: "900",
      maxSurgeFeeBps: "1000",
      protocolFeeBps: 500,
    });
    console.log("Launch Token", launchTx);

    // Get buy quote
    console.log("Getting buy quote...");
    const buyQuote = await sdk.read.getBuyQuote(
      testTokenAddress,
      amountETHToUseForBuy1
    );
    console.log("Buy Quote:", buyQuote);

    // Buy tokens
    console.log("Buying tokens...");
    const buyTx = await sdk.write.buyToken({
      token: testTokenAddress,
      amountIn: amountETHToUseForBuy1,
      amountOutMin: "0",
      to: publicKey,
      value: amountETHToUseForBuy1,
    });
    console.log("Buy transaction hash:", buyTx.hash);
    await buyTx.wait();

    // Get sell quote
    console.log("Getting sell quote...");
    const sellQuote = await sdk.read.getSellQuote(
      testTokenAddress,
      amountTokensToSell
    );
    console.log("Sell Quote:", sellQuote);

    // Approve and sell
    console.log("Approving and selling tokens...");
    const sellTx = await sdk.write.approveAndSell({
      token: testTokenAddress,
      amountIn: amountTokensToSell,
      amountOutMin: "0",
      to: publicKey,
    });
    console.log("Sell transaction hash:", sellTx.hash);
    await sellTx.wait();

    // Claim fees
    console.log("Claiming fees...");
    const claimTx = await sdk.write.claimFee(testTokenAddress);
    console.log("Claim transaction hash:", claimTx.hash);
    await claimTx.wait();

    // Buy more tokens
    console.log("Getting second buy quote...");
    const buyQuote2 = await sdk.read.getBuyQuote(
      testTokenAddress,
      amountETHToUseForBuy2
    );
    console.log("Second Buy Quote:", buyQuote2);

    console.log("Buying more tokens...");
    const buyTx2 = await sdk.write.buyToken({
      token: testTokenAddress,
      amountIn: amountETHToUseForBuy2,
      amountOutMin: "0",
      to: publicKey,
      value: amountETHToUseForBuy2,
    });
    console.log("Second buy transaction hash:", buyTx2.hash);
    await buyTx2.wait();

    // Graduate token
    console.log("Graduating token...");
    const graduateTx = await sdk.write.graduateToken(testTokenAddress, true);
    console.log("Graduate transaction hash:", graduateTx.hash);
    await graduateTx.wait();

    console.log("All steps completed successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
