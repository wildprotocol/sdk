import { Address } from "viem";
import { EthersDeployer } from "../src/clients/ethers";

// Replace with your actual private key and recipient
const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY_HERE";
const RECIPIENT = "0x0e3E591cdA42517D6DEd61D9DC3165AdDD179a8d";
const CREATOR = "0x0e3E591cdA42517D6DEd61D9DC3165AdDD179a8d";
const TEST_TOKEN_ADDRESS = "0x7a6fc57969035709a261c612dB698c29ca7B3DDb";

const rpcUrl = "https://sepolia.base.org";

// --- Bonding Curve Setup ---
const stepCount = 5;
const totalBondingCurveTokens = 1_000_000n * 10n ** 18n;
const stepSize = (totalBondingCurveTokens / BigInt(stepCount)).toString();
const numSteps = stepCount.toString();
const prices = Array.from({ length: stepCount }, (_, i) =>
  (BigInt(i + 1) * 10n ** 24n).toString()
);

// --- LaunchToken Configuration ---
const tokenParams = {
  creator: RECIPIENT as Address,
  baseToken: "0x0000000000000000000000000000000000000000" as Address,
  name: "Alpha Token",
  symbol: "ALPT",
  image: "https://example.com/token.png",
  teamSupply: "100000000000000000000000", // 100,000 tokens
  bondingCurveSupply: "1000000000000000000000000",
  liquidityPoolSupply: "1000000000000000000000000",
  totalSupply: "2100000000000000000000000",
  bondingCurveBuyFee: "100", // 1%
  bondingCurveSellFee: "100", // 1%
  allowForcedGraduation: false,
  graduationFeeBps: "100", // 1%
  poolFees: 20000, // 2%
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

async function main() {
  const sdk = new EthersDeployer({
    network: "base-sepolia",
    rpcUrl,
    privateKey: PRIVATE_KEY,
    version: "v3",
  });

  try {
    // 🔨 Launch Token
    const result = await sdk.write.launchToken(tokenParams);
    console.log("✅ Token launched successfully!");
    console.log("Transaction hash:", result.tx.hash);
    console.log("Token address:", result.createdTokenAddress);

    // 🧾 Get Buy Quote for 0.001 ETH
    const buyQuote = await sdk.read.getBuyQuote(TEST_TOKEN_ADDRESS, "0.001");
    console.log("💰 Buy Quote (0.001 ETH):", buyQuote);

    // 💸 Get Sell Quote for 10 tokens
    const sellQuote = await sdk.read.getSellQuote(TEST_TOKEN_ADDRESS, "10");
    console.log("📉 Sell Quote (0.001 ETH):", sellQuote);

    // 💸 Buy Token
    const buyTx = await sdk.write.buyToken({
      amountIn: "0.001", // 0.001 ETH
      token: TEST_TOKEN_ADDRESS,
      amountOutMin: "0", // Minimum expected token amount
      to: RECIPIENT,
    });
    console.log("🛒 Buy Tx Hash:", buyTx);

    // 🔁 Approve and Sell Token
    const sellTx = await sdk.write.approveAndSell({
      amountIn: "0.0001", // 0.0001 tokens
      token: TEST_TOKEN_ADDRESS,
      amountOutMin: "0", // Minimum expected ETH out
      to: RECIPIENT,
    });
    console.log("💸 Sell Tx Hash:", sellTx);

    // 🎓 Graduate the token
    const graduate = await sdk.write.graduateToken(
      TEST_TOKEN_ADDRESS, // use the same token address deployed earlier
      true // allowPreGraduation: set to true if early graduation is allowed
    );
    console.log("🎓 Graduate Tx:", graduate);

    // 🔮 Predict token address before deployment (optional)
    // You can use this if you want to know the address of the token before it's actually launched
    const predictedAddress = await sdk.read.getPredictedTokenAddress(
      CREATOR, // same creator used in tokenParams
      "0xSALT" // 32 Byte salt
    );
    console.log("🔮 Predicted token address:", predictedAddress);

    // 📈 Fetch token price
    // Useful for showing current market price to users
    const getTokenPrice = await sdk.read.getTokenPrice(TEST_TOKEN_ADDRESS);
    console.log("📈 Token price:", getTokenPrice);

    // 🎓 Check graduation status of a token
    // Indicates whether a token has graduated from bonding curve to liquidity pool
    const isGraduated = await sdk.read.isGraduated(TEST_TOKEN_ADDRESS);
    console.log("🎓 Token graduated?", isGraduated);

    // 💰 Get accrued protocol fees for a graduated token
    const fees = await sdk.read.getFees(TEST_TOKEN_ADDRESS);
    console.log("💰 Fee transaction hash:", fees);

    // 💰 Claim accrued protocol fees for a graduated token
    // Can be called after graduation to collect earned fees (if any)
    const claimFee = await sdk.write.claimFee(TEST_TOKEN_ADDRESS);
    console.log("💰 Claimed fee transaction hash:", claimFee);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
