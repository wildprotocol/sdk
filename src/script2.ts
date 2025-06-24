import { ethers, Wallet } from 'ethers';
import { DEPLOYER_ABI, DeployerSDK } from '../src';

// read private key from .env
const privateKey = "0x5658f19b09e79291bd25bb08be4961f81d9fc02a071a1f7ddba05dfa02c904a1";


if (!privateKey) {
  throw new Error('PRIVATE_KEY is not set');
}

const publicKey = new Wallet(privateKey).address;
console.log('Public key:', publicKey);


const deployerContractAddress = '0x046e2ada75ba114af04a11c5ae935d3814c9fc53';
const amountUSDCToUseForBuy1 = '10000'; // 0.01 USDC
const amountTokensToSell = '770000000000000000000'; // 770 x 10^18, calculated depending in prices below
const amountUSDCToUseForBuy2 = '100000'; // 0.1 USDC should be enough to graduate
const protocolFeeRecipient = '0x1234567890123456789012345678901234567890';
const usdcAddrss = "0xCA11121e2e8D5f5C183eEa0261a85D9bb06587C7"


const randomNumber = String(Math.floor(Math.random() * 10000));

async function main() {
  // Initialize the SDK
  const sdk =  DeployerSDK.getDeployer({
    client: "ethers",
    rpcUrl: 'https://sepolia.base.org',
    privateKey: privateKey, // Or use signer instead
    network: 'base-sepolia'
  });

  try {


  // Launch a new token
    console.log('Launching new token...');
    const launchTx = await (await sdk).write.launchToken({
      name: 'TT_' + randomNumber,
      symbol: 'TTK_' + randomNumber,
      image: 'https://example.com/image.png',
      creator: publicKey,
      baseToken: "0x0000000000000000000000000000000000000000", // ETH
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
        prices: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20'], // Price points
        numSteps: '10',
        stepSize: '500000000000000000000' // 500 tokens per step, 500 * 10 = 5000 tokens
      },
      allowForcedGraduation: false,
      graduationFeeBps: '0',
      graduationFeeSplits: [],
      poolFees: 3000, // 0.3%
      poolFeeSplits: [
        { recipient: publicKey, bps: '9500' },
        { recipient: protocolFeeRecipient, bps: '500' } // 5% to protocol fee recipient mandatory
      ],
      surgeFeeDuration: '900', // 15 minutes
      maxSurgeFeeBps: '1000' // 10%
    });

    console.log('Launch transaction hash:', launchTx);
    // const launchReceipt = await (await sdk).write.waitForTransaction(launchTx?.hash);
    // console.log('Launch transaction confirmed:', launchReceipt);

    // const iface = new ethers.Interface(DEPLOYER_ABI);

    // // Loop through logs to find the TokenLaunched event
    // let createdTokenAddress = null;

    // for (const log of launchReceipt.logs) {
      
    //   try {
    //     const parsedLog = iface.parseLog(log);        
    //     if (parsedLog.name === 'TokenLaunched') {
    //       createdTokenAddress = parsedLog.args.token;
    //       console.log('Created Token Address:', createdTokenAddress);
    //       // return createdTokenAddress; // Return the address of the created token
    //       // break; // Found it, no need to continue
    //     }
    //   } catch (err) {
    //     // Skip logs that don't belong to this contract
    //     // console.log('err getting token address', err);
    //   }
    // }

    // // Step 1: Get buy quote
    // console.log('Getting buy quote...', createdTokenAddress);
    // const buyQuote = await (await sdk).read.getBuyQuote(
    //   createdTokenAddress, // Token address
    //   "0.0001" // Amount in USDC
    // );
    // console.log('Buy Quote:', {
    //   amountOut: parseInt(buyQuote.amountOut.toString()) / 10 ** 18,
    //   amountInUsed: parseInt(buyQuote.amountInUsed.toString()) / 10 ** 18,
    // });

    // // Step 2: Buy tokens
    // console.log('Buying tokens...');

    // console.log("Approving USDC for buying...");
    // const approveTx1 = await (await sdk).write.approveToken(usdcAddrss, deployerContractAddress, amountUSDCToUseForBuy1);
    // console.log('Approve transaction hash:', approveTx1.hash);
    // const approveReceipt1 = await (await sdk).write.waitForTransaction(approveTx1);
    // console.log('Approve transaction confirmed:', approveReceipt1?.hash);

    
    // const buyTx = await (await sdk).write.buyToken({
    //   token: testTokenAddress,
    //   amountIn: amountUSDCToUseForBuy1, // 1 USDC
    //   amountOutMin: '0', // Minimum tokens to receive (set proper slippage)
    //   to: publicKey, // Recipient address
    //   value: "0" // ETH value to send
    // });
    
    // console.log('Buy transaction hash:', buyTx.hash);
    // const buyReceipt = await (await sdk).write.waitForTransaction(buyTx);
    // console.log('Buy transaction confirmed:', buyReceipt?.hash);

    

    // // Step 3: Get sell quote
    // console.log('Getting sell quote...');
    // const sellQuote = await (await sdk).read.getSellQuote(
    //   testTokenAddress, // Token address
    //   amountTokensToSell // Amount of tokens to sell
    // );
    // console.log('Sell Quote:', {
    //   amountOut: parseInt(sellQuote.amountOut.toString()) / 10 ** 6,
    //   fee: parseInt(sellQuote.fee.toString()) / 10 ** 6,
    // });

    // // Step 4: Sell tokens (requires token approval first)
    // console.log('Approving tokens for selling...');
    // console.log('Approving', amountTokensToSell, 'tokens for selling');
    // const approveTx = await (await sdk).write.approveToken(testTokenAddress, deployerContractAddress, amountTokensToSell);
    // console.log('Approve transaction hash:', approveTx.hash);
    // const approveReceipt = await (await sdk).write.waitForTransaction(approveTx);
    // console.log('Approve transaction confirmed:', approveReceipt?.hash);

    // console.log('Selling tokens...');
    // const sellTx = await (await sdk).write.sellToken({
    //   token: testTokenAddress,
    //   amountIn: amountTokensToSell,
    //   amountOutMin: '0', // Minimum ETH to receive (set proper slippage)
    //   to: publicKey // Recipient address
    // });
    
    // console.log('Sell transaction hash:', sellTx.hash);
    // const sellReceipt = await (await sdk).write.waitForTransaction(sellTx);
    // console.log('Sell transaction confirmed:', sellReceipt?.hash);

    
    // // Step 5: Claim fees (if you're a fee recipient)
    // console.log('Claiming fees...');
    // const claimTx = await (await sdk).write.claimFee(testTokenAddress);
    // console.log('Claim transaction hash:', claimTx.hash);
    // const claimReceipt = await (await sdk).write.waitForTransaction(claimTx);
    // console.log('Claim transaction confirmed:', claimReceipt?.hash);


    // // Step 6: Buy more tokens
    // console.log('Getting buy quote for more tokens...');


    // const buyQuote2 = await (await sdk).read.getBuyQuote(
    //   testTokenAddress, // Token address
    //   amountUSDCToUseForBuy2 // Amount in USDC
    // );
    // console.log('Buy Quote:', {
    //   amountOut: parseInt(buyQuote2.amountOut.toString()) / 10 ** 18,
    //   amountInUsed: parseInt(buyQuote2.amountInUsed.toString()) / 10 ** 6,
    //   fee: parseInt(buyQuote2.fee.toString()) / 10 ** 6,
    // });


    // console.log("Approving USDC for buying...");
    // const approveTx2 = await (await sdk).write.approveToken(usdcAddrss, deployerContractAddress, amountUSDCToUseForBuy2);
    // console.log('Approve transaction hash:', approveTx2.hash);
    // const approveReceipt2 = await (await sdk).write.waitForTransaction(approveTx2);
    // console.log('Approve transaction confirmed:', approveReceipt2?.hash);


    // console.log('Buying more tokens...');
    // const buyTx2 = await (await sdk).write.buyToken({
    //   token: testTokenAddress,
    //   amountIn: amountUSDCToUseForBuy2,
    //   amountOutMin: '0',
    //   to: publicKey,
    //   value: amountUSDCToUseForBuy2
    // });
    // console.log('Buy transaction hash:', buyTx2.hash); // excess eth is returned
    // const buyReceipt2 = await (await sdk).write.waitForTransaction(buyTx2);
    // console.log('Buy transaction confirmed:', buyReceipt2?.hash);

    // // Graduate token
    // console.log('Graduating token...');
    // const graduateTx = await (await sdk).write.graduateToken(testTokenAddress, true); // Allow pre-graduation
    // console.log('Graduate transaction hash:', graduateTx.hash);
    // const graduateReceipt = await (await sdk).write.waitForTransaction(graduateTx);
    // console.log('Graduate transaction confirmed:', graduateReceipt?.hash);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);