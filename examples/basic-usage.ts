import { Wallet } from 'ethers';
import { DeployerSDK } from '../src';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// read private key from .env
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error('PRIVATE_KEY is not set');
}

const publicKey = new Wallet(privateKey).address;
console.log('Public key:', publicKey);


const deployerContractAddress = '0x8e095febb45a3c852e81599fa9e155be83b67e2c';
const amountETHToUseForBuy1 = '0.0000001';
const amountTokensToSell = '770'; // calculated depending in prices below
const amountETHToUseForBuy2 = '0.000001'; // should be enough to graduate
const protocolFeeRecipient = '0x1234567890123456789012345678901234567890';
const testTokenAddress = "0x03DDCF4ab7bF145bCf221bE21c52c6b10C2A6BC5";

const randomNumber = String(Math.floor(Math.random() * 10000));

const account = privateKeyToAccount(privateKey as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

async function main() {
  // Initialize the SDK
  const sdk = await DeployerSDK.getDeployer({
    client: "viem",
    network: "base-sepolia",
    rpcUrl: "https://sepolia.base.org",
    walletClient: walletClient, // viem wallet client
  });

  try {

    // Check if base token is whitelisted
    // base token must be whitelisted to launch a token with it
    const isWhitelisted = await sdk.read.isBaseTokenWhitelisted('0x0000000000000000000000000000000000000000');
    console.log('ETH is whitelisted:', isWhitelisted);


  // Launch a new token
    console.log('Launching new token...');
    const launchTx = await sdk.write.launchToken({
      name: 'TT_' + randomNumber,
      symbol: 'TTK_' + randomNumber,
      image: 'https://example.com/image.png',
      creator: publicKey as `0x${string}`, // Ensure this is a valid address format
      baseToken: '0x0000000000000000000000000000000000000000', // ETH
      teamSupply: '1000000000000000000000000', // 1M tokens (18 decimals)
      totalSupply: '10000000000000000000000000', // 10M tokens
      bondingCurveSupply: '5000000000000000000000', // 5K tokens
      liquidityPoolSupply: '995000000000000000000000', // 995K tokens
      bondingCurveBuyFee: '250', // 2.5% (250 basis points)
      bondingCurveSellFee: '250', // 2.5%
      bondingCurveFeeSplits: [
        { recipient: publicKey as `0x${string}`, bps: BigInt(9500) },
        { recipient: protocolFeeRecipient as `0x${string}`, bps: BigInt(500) } // 5% to protocol fee recipient mandatory
      ],
      bondingCurveParams: {
        prices: ['110000000', '120000000', '130000000', '140000000', '150000000', '160000000', '170000000', '180000000', '190000000', '200000000'], // Price points
        numSteps: '10',
        stepSize: '500000000000000000000' // 500 tokens per step, 500 * 10 = 5000 tokens
      },
      allowForcedGraduation: false,
      graduationFeeBps: '0', // 5%
      graduationFeeSplits: [],
      poolFees: 3000, // 0.3%
      poolFeeSplits: [
        { recipient: publicKey as `0x${string}`, bps: BigInt(9500) },
        { recipient: protocolFeeRecipient as `0x${string}`, bps: BigInt(500) } // 5% to protocol fee recipient mandatory
      ],
      surgeFeeDuration: '900', // 15 minutes
      maxSurgeFeeBps: '1000', // 10%
    });

    console.log('Launch transaction hash:', launchTx.hash);
    // Wait for the transaction to be confirmed, this might take a while, once complete will return the token address

    // Step 1: Get buy quote
    console.log('Getting buy quote...');
    const buyQuote = await sdk.read.getBuyQuote(
      testTokenAddress, // Token address
      amountETHToUseForBuy1 // Amount in ETH
    );
    console.log('Buy Quote:', {
      amountOut: buyQuote.amountOut, // amount of tokens to receive, this is in wei
      amountInUsed: buyQuote.amountInUsed, // amount of ETH used, this is in wei
    });

    // Step 2: Buy tokens
    console.log('Buying tokens...');
    const buyTx = await sdk.write.buyToken({
      token: testTokenAddress,
      amountIn: amountETHToUseForBuy1, // 1 ETH
      amountOutMin: '0', // Minimum tokens to receive (set proper slippage)
      to: publicKey, // Recipient address
      value: amountETHToUseForBuy1 // ETH value to send
    });
    
    console.log('Buy transaction hash:', buyTx.hash);
  
    // Step 3: Get sell quote
    console.log('Getting sell quote...');
    const sellQuote = await sdk.read.getSellQuote(
      testTokenAddress, // Token address
      amountTokensToSell // Amount of tokens to sell
    );
    console.log('Sell Quote:', {
      amountOut: sellQuote.amountOut, // amount of ETH to receive, this is in wei
      amountInUsed: sellQuote.amountInUsed, // amount of tokens used, this is in wei
    });

    // Step 4: Sell tokens (requires token approval first)
    console.log('Approving tokens for selling...');
    console.log('Approving', amountTokensToSell, 'tokens for selling');
    const sellTx = await sdk.write.approveAndSell({
      token: testTokenAddress,
      amountIn: amountTokensToSell, // Amount of tokens to sell
      amountOutMin: '0', // Minimum ETH to receive (set proper slippage)
      to: publicKey // Address that will spend the tokens (Deployer contract)
    });
    console.log('Selling tokens...');
    console.log('Sell transaction hash:', sellTx.hash);
  
    // Step 5: Claim fees (if you're a fee recipient)
    console.log('Claiming fees...');
    const claimTx = await sdk.write.claimFee(testTokenAddress);
    console.log('Claim transaction hash:', claimTx.hash);
 
    // Step 6: Buy more tokens
    console.log('Getting buy quote for more tokens...');
    const buyQuote2 = await sdk.read.getBuyQuote(
      testTokenAddress, // Token address
      amountETHToUseForBuy2 // Amount in ETH
    );
    console.log('Buy Quote:', {
      amountOut: buyQuote2.amountOut,
      amountInUsed: buyQuote2.amountInUsed,
    });

    console.log('Buying more tokens...');
    const buyTx2 = await sdk.write.buyToken({
      token: testTokenAddress,
      amountIn: amountETHToUseForBuy2,
      amountOutMin: '0',
      to: publicKey,
      value: amountETHToUseForBuy2
    });
    console.log('Buy transaction hash:', buyTx2.hash); // excess eth is returned
  
    // Graduate token
    console.log('Graduating token...');
    const graduateTx = await sdk.write.graduateToken(testTokenAddress, true); // Allow pre-graduation
    console.log('Graduate transaction hash:', graduateTx.hash);
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
