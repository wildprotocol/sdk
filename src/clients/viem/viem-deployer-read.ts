import { createPublicClient, decodeErrorResult, http, parseEther, formatEther, BaseError, ContractFunctionRevertedError } from 'viem';

import { BuyQuote, SDKConfig, SellQuote, AutoGraduationParams, PoolKey, TokenDeploymentConfig, TokenState, FeeSplit } from '../../types';
import { DEPLOYER_ABI } from '../../abis/deployer-abi';
import { CONTRACTS, SupportedNetworks } from '../../config';
import { STATEMANAGER_ABI } from '../../abis/statemanager-abi';

export class ViemDeployerReader {
  protected publicClient: ReturnType<typeof createPublicClient>;
  protected deployerAddress: `0x${string}`;
  protected stateManagerAddress: `0x${string}`;

  constructor(config: SDKConfig & { network: SupportedNetworks }) {
    if (!config.rpcUrl) throw new Error('RPC URL is required');

    const networkContracts = CONTRACTS[config.network];
    if (!networkContracts) throw new Error(`Unsupported network: ${config.network}`);

    this.publicClient = createPublicClient({
      transport: http(config.rpcUrl),
    });

    this.deployerAddress = networkContracts.DEPLOYER_ADDRESS as `0x${string}`;
    this.stateManagerAddress = networkContracts.STATE_MANAGER_ADDRESS as `0x${string}`;
  }

  private async callDeployer(functionName: string, args: any[] = []): Promise<any> {
    return await this.publicClient.readContract({
      address: this.deployerAddress,
      abi: DEPLOYER_ABI,
      functionName: functionName,
      args,
    });
  }

  private async callStateManager(functionName: string, args: any[] = []): Promise<any> {
    return await this.publicClient.readContract({
      address: this.stateManagerAddress,
      abi: STATEMANAGER_ABI,
      functionName,
      args,
    });
  }

  async getBuyQuote(token: string, amountIn: string): Promise<BuyQuote> {
    try {
      // This call should always revert, which is expected in this quote system
      await this.publicClient.simulateContract({
        address: this.deployerAddress,
        account: this.deployerAddress,
        abi: DEPLOYER_ABI,
        functionName: 'buyQuote',
        args: [token as `0x${string}`, parseEther(amountIn)],
      });
  
      // If no revert happened, it's an error in the flow
      throw new Error('buy quote did not throw as expected');
  
    } catch (error: any) {
      if (error instanceof BaseError) {
        const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);
  
        if (revertError instanceof ContractFunctionRevertedError && revertError.data?.args) {
          const [amountOut, effectiveAmountIn] = revertError.data.args;
  
          return {
            amountOut,
            amountInUsed: effectiveAmountIn,
          };
        }
      }
  
      console.error('Unexpected error:', error);
      throw new Error('buy quote did not throw as expected');
    }
  }
  
  async getSellQuote(token: string, amountIn: string): Promise<SellQuote> {
    try {
      // This call should always revert to return the quote data
      await this.publicClient.simulateContract({
        address: this.deployerAddress,
        account: this.deployerAddress,
        abi: DEPLOYER_ABI,
        functionName: 'sellQuote',
        args: [token as `0x${string}`, parseEther(amountIn)],
      });
  
      // If no revert happened, it's an error in the flow
      throw new Error('sell quote did not throw as expected');
  
    } catch (error: any) {
      if (error instanceof BaseError) {
        const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);
  
        if (revertError instanceof ContractFunctionRevertedError && revertError.data?.args) {
          const [amountOut, effectiveAmountIn] = revertError.data.args as [bigint, bigint];
  
          return {
            amountOut,
            amountInUsed: effectiveAmountIn,
          };
        }
      }
  
      console.error('Unexpected error:', error);
      throw new Error('sell quote did not throw as expected');
    }
  }
  

  async getOwner(): Promise<string> {
    return await this.callDeployer('owner');
  }

  async isBaseTokenWhitelisted(token: string): Promise<boolean> {
    return await this.callDeployer('isBaseTokenWhitelisted', [token]);
  }

  async getTokenState(token: string): Promise<TokenState> {
    const result = await this.callStateManager('getTokenState', [token]);
  
    return {
      tokensInBondingCurve: BigInt(result.tokensInBondingCurve),
      baseTokensInBondingCurve: BigInt(result.baseTokensInBondingCurve),
      // lastPrice: result.lastPrice ? BigInt(result.lastPrice) : 0n, // in your log, 'lastPrice' was missing, so provide fallback
      // totalFees: result.totalFees ? BigInt(result.totalFees) : 0n, // same here
      isGraduated: result.isGraduated, // your ABI returns 'isGraduated' not 'graduated'
      poolAddress: result.poolAddress,
    };
  }

  async getProtocolFeeShare(): Promise<number> {
    return Number(await this.callStateManager('PROTOCOL_FEE_SHARE'));
  }

  async getBondingCurveFeeAccumulated(token: string): Promise<string> {
    const result = await this.callStateManager('bondingCurveFeeAccumulated', [token]);
    return formatEther(result);
  }

  async getAutoGraduationParams(token: string): Promise<AutoGraduationParams> {
    const result = await this.callStateManager('getAutoGraduationParams', [token]);

    return {
      tickSpacing: Number(result[0]),
      startingTick: Number(result[1]),
      endTick: Number(result[2]),
      targetTick: Number(result[3]),
      poolFee: Number(result[4]),
    };
  }

  async getBaseToken(token: string): Promise<string> {
    return await this.callStateManager('getBaseToken', [token]);
  }

  async getPoolKey(token: string): Promise<PoolKey> {
    const result = await this.callStateManager('getPoolKey', [token]);

    return {
      token0: result.currency0,
      token1: result.currency1,
      tickSpacing: Number(result.tickSpacing),
      fee: Number(result.fee),
    };
  }

  async getSurgeFee(config: TokenDeploymentConfig): Promise<string> {
    const result = await this.callStateManager('getSurgeFee', [config]);
    return formatEther(result);
  }

  async getTokenDeploymentConfig(token: string): Promise<TokenDeploymentConfig> {
    const result = await this.callStateManager('getTokenDeploymentConfig', [token]);

    return {
      creator: result.creator,
      baseToken: result.baseToken,
      name: result.name,
      symbol: result.symbol,
      image: result.image,
      teamSupply: result.teamSupply.toString(),
      bondingCurveSupply: result.bondingCurveSupply.toString(),
      liquidityPoolSupply: result.liquidityPoolSupply.toString(),
      totalSupply: result.totalSupply.toString(),
      bondingCurveBuyFee: result.bondingCurveBuyFee,
      bondingCurveSellFee: result.bondingCurveSellFee,
      allowForcedGraduation: result.allowForcedGraduation,
      graduationFeeBps: result.graduationFeeBps,
      poolFees: result.poolFees,
      surgeFeeStartingTime: result.surgeFeeStartingTime.toString(),
      surgeFeeDuration: result.surgeFeeDuration.toString(),
      maxSurgeFeeBps: result.maxSurgeFeeBps,
      bondingCurveFeeSplits: result.bondingCurveFeeSplits.map((split: any) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      graduationFeeSplits: result.graduationFeeSplits.map((split: any) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      poolFeeSplits: result.poolFeeSplits.map((split: any) => ({
        recipient: split.recipient,
        bps: split.bps,
      })),
      bondingCurveParams: result.bondingCurveParams,
      vestingStartTime: result.vestingStartTime?.toString() || '0',
      vestingDuration: result.vestingDuration?.toString() || '0',
      vestingWallet: result.vestingWallet,
      appIdentifier: result.appIdentifier || '',
    };
  }

  async getTokenSupply(token: string): Promise<string> {
    const result = await this.callStateManager('getTokenSupply', [token]);
    return formatEther(result);
  }

  async isGraduated(token: string): Promise<boolean> {
    return await this.callStateManager('isGraduated', [token]);
  }

  async getProtocolFeeRecipient(): Promise<string> {
    return await this.callStateManager('protocolFeeRecipient');
  }

  async getPoolFeeSplits(token: string): Promise<FeeSplit[]> {
    const splits = await this.callStateManager('poolFeeSplits', [token]);

    return splits.map((split: any) => ({
      recipient: split.recipient,
      bps: split.bps,
    }));
  }

  async getPositionManager(): Promise<string> {
    return await this.callStateManager('positionManager');
  }

  async getStateView(): Promise<string> {
    return await this.callStateManager('stateView');
  }

  async getTokenIdRecipient(): Promise<string> {
    return await this.callStateManager('tokenIdRecipient');
  }

  async getTokenDeploymentConfigsMapping(token: string): Promise<TokenDeploymentConfig> {
    return await this.getTokenDeploymentConfig(token);
  }

  async getTokenStatesMapping(token: string): Promise<TokenState> {
    return await this.getTokenState(token);
  }
}
