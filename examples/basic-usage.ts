import { Wallet } from 'ethers';
import { DeployerSDK } from '../src';

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


const randomNumber = String(Math.floor(Math.random() * 10000));

async function main() {
  // Initialize the SDK
  const sdk = new DeployerSDK({
    contractAddress: deployerContractAddress, // Replace with actual contract address
    rpcUrl: 'https://mainnet.base.org',
    privateKey: privateKey // Or use signer instead
  });

  try {

    // Check if base token is whitelisted
    // base token must be whitelisted to launch a token with it
    const isWhitelisted = await sdk.isBaseTokenWhitelisted('0x0000000000000000000000000000000000000000');
    console.log('ETH is whitelisted:', isWhitelisted);


  // Launch a new token
    console.log('Launching new token...');
    const launchTx = await sdk.launchToken({
      name: 'TT_' + randomNumber,
      symbol: 'TTK_' + randomNumber,
      image: 'https://example.com/image.png',
      creator: publicKey,
      baseToken: '0x0000000000000000000000000000000000000000', // ETH
      teamSupply: '1000000000000000000000000', // 1M tokens (18 decimals)
      bondingCurveSupply: '5000000000000000000000', // 5K tokens
      liquidityPoolSupply: '995000000000000000000000', // 995K tokens
      bondingCurveBuyFee: '250', // 2.5% (250 basis points)
      bondingCurveSellFee: '250', // 2.5%
      bondingCurveFeeSplits: [
        { recipient: publicKey, bps: '9500' },
        { recipient: protocolFeeRecipient, bps: '500' } // 5% to protocol fee recipient mandatory
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
        { recipient: publicKey, bps: '9500' },
        { recipient: protocolFeeRecipient, bps: '500' } // 5% to protocol fee recipient mandatory
      ],
      surgeFeeDuration: '900', // 15 minutes
      maxSurgeFeeBps: '1000' // 10%
    });

    console.log('Launch transaction hash:', launchTx.hash);
    const launchReceipt = await sdk.waitForTransaction(launchTx);
    console.log('Launch transaction confirmed:', launchReceipt?.hash);
    
    // Get the launched token address
    const testTokenAddress = sdk.getTokenAddressFromReceipt(launchReceipt);
    console.log('Launched token address:', testTokenAddress);

    if (!testTokenAddress) {
      throw new Error('Failed to get token address from launch receipt');
    }

    // Step 1: Get buy quote
    console.log('Getting buy quote...');
    const buyQuote = await sdk.getBuyQuote(
      testTokenAddress, // Token address
      amountETHToUseForBuy1 // Amount in ETH
    );
    console.log('Buy Quote:', {
      amountOut: DeployerSDK.formatEther(buyQuote.amountOut),
      amountInUsed: DeployerSDK.formatEther(buyQuote.amountInUsed),
      fee: DeployerSDK.formatEther(buyQuote.fee),
    });

    // Step 2: Buy tokens
    console.log('Buying tokens...');
    const buyTx = await sdk.buyToken({
      token: testTokenAddress,
      amountIn: amountETHToUseForBuy1, // 1 ETH
      amountOutMin: '0', // Minimum tokens to receive (set proper slippage)
      to: publicKey, // Recipient address
      value: amountETHToUseForBuy1 // ETH value to send
    });
    
    console.log('Buy transaction hash:', buyTx.hash);
    const buyReceipt = await sdk.waitForTransaction(buyTx);
    console.log('Buy transaction confirmed:', buyReceipt?.hash);

    

    // Step 3: Get sell quote
    console.log('Getting sell quote...');
    const sellQuote = await sdk.getSellQuote(
      testTokenAddress, // Token address
      amountTokensToSell // Amount of tokens to sell
    );
    console.log('Sell Quote:', {
      amountOut: DeployerSDK.formatEther(sellQuote.amountOut),
      fee: DeployerSDK.formatEther(sellQuote.fee)
    });

    // Step 4: Sell tokens (requires token approval first)
    console.log('Approving tokens for selling...');
    console.log('Approving', amountTokensToSell, 'tokens for selling');
    const approveTx = await sdk.approveToken(testTokenAddress, amountTokensToSell);
    console.log('Approve transaction hash:', approveTx.hash);
    const approveReceipt = await sdk.waitForTransaction(approveTx);
    console.log('Approve transaction confirmed:', approveReceipt?.hash);

    console.log('Selling tokens...');
    const sellTx = await sdk.sellToken({
      token: testTokenAddress,
      amountIn: amountTokensToSell,
      amountOutMin: '0', // Minimum ETH to receive (set proper slippage)
      to: publicKey // Recipient address
    });
    
    console.log('Sell transaction hash:', sellTx.hash);
    const sellReceipt = await sdk.waitForTransaction(sellTx);
    console.log('Sell transaction confirmed:', sellReceipt?.hash);

    
    // Step 5: Claim fees (if you're a fee recipient)
    console.log('Claiming fees...');
    const claimTx = await sdk.claimFee(testTokenAddress);
    console.log('Claim transaction hash:', claimTx.hash);
    const claimReceipt = await sdk.waitForTransaction(claimTx);
    console.log('Claim transaction confirmed:', claimReceipt?.hash);


    // Step 6: Buy more tokens
    console.log('Getting buy quote for more tokens...');
    const buyQuote2 = await sdk.getBuyQuote(
      testTokenAddress, // Token address
      amountETHToUseForBuy2 // Amount in ETH
    );
    console.log('Buy Quote:', {
      amountOut: DeployerSDK.formatEther(buyQuote2.amountOut),
      amountInUsed: DeployerSDK.formatEther(buyQuote2.amountInUsed),
      fee: DeployerSDK.formatEther(buyQuote2.fee)
    });



    console.log('Buying more tokens...');
    const buyTx2 = await sdk.buyToken({
      token: testTokenAddress,
      amountIn: amountETHToUseForBuy2,
      amountOutMin: '0',
      to: publicKey,
      value: amountETHToUseForBuy2
    });
    console.log('Buy transaction hash:', buyTx2.hash); // excess eth is returned
    const buyReceipt2 = await sdk.waitForTransaction(buyTx2);
    console.log('Buy transaction confirmed:', buyReceipt2?.hash);

    // Graduate token
    console.log('Graduating token...');
    const graduateTx = await sdk.graduateToken(testTokenAddress, true); // Allow pre-graduation
    console.log('Graduate transaction hash:', graduateTx.hash);
    const graduateReceipt = await sdk.waitForTransaction(graduateTx);
    console.log('Graduate transaction confirmed:', graduateReceipt?.hash);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);