export const STATEMANAGER_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "initialOwner",
        type: "address",
        internalType: "address",
      },
      {
        name: "permit2Address",
        type: "address",
        internalType: "address",
      },
      {
        name: "_positionManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "_stateView",
        type: "address",
        internalType: "address",
      },
      {
        name: "_protocolFeeRecipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenIdRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "PROTOCOL_FEE_SHARE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bondingCurveFeeAccumulated",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buyToken",
    inputs: [
      {
        name: "buyer",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountOutMin",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "claimFee",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAutoGraduationParams",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "tickSpacing",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "startingTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "endTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "targetTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "poolFee",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBaseToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBuyQuote",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolKey",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "fee",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "tickSpacing",
            type: "int24",
            internalType: "int24",
          },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSellQuote",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSurgeFee",
    inputs: [
      {
        name: "config",
        type: "tuple",
        internalType: "struct StateManager.TokenDeploymentConfig",
        components: [
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "baseToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "image",
            type: "string",
            internalType: "string",
          },
          {
            name: "appIdentifier",
            type: "string",
            internalType: "string",
          },
          {
            name: "teamSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingStartTime",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingDuration",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingWallet",
            type: "address",
            internalType: "address",
          },
          {
            name: "bondingCurveSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityPoolSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveBuyFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveSellFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "bondingCurveParams",
            type: "tuple",
            internalType: "struct PriceCurve",
            components: [
              {
                name: "prices",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "numSteps",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "stepSize",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "allowForcedGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "allowAutoGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "graduationFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "graduationFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "poolFees",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "poolFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "surgeFeeStartingTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surgeFeeDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxSurgeFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "fee",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenDeploymentConfig",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct StateManager.TokenDeploymentConfig",
        components: [
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "baseToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "image",
            type: "string",
            internalType: "string",
          },
          {
            name: "appIdentifier",
            type: "string",
            internalType: "string",
          },
          {
            name: "teamSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingStartTime",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingDuration",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingWallet",
            type: "address",
            internalType: "address",
          },
          {
            name: "bondingCurveSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityPoolSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveBuyFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveSellFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "bondingCurveParams",
            type: "tuple",
            internalType: "struct PriceCurve",
            components: [
              {
                name: "prices",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "numSteps",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "stepSize",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "allowForcedGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "allowAutoGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "graduationFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "graduationFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "poolFees",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "poolFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "surgeFeeStartingTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surgeFeeDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxSurgeFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenPrice",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenState",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct StateManager.TokenState",
        components: [
          {
            name: "isGraduated",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "tokensInBondingCurve",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "baseTokensInBondingCurve",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "poolAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "uniswapTokenId",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenSupply",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "graduateToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "allowPreGraduation",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isGraduated",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "launchV4Pool",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "tickSpacing",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "startingTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "endingTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "targetTick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "allowPreGraduation",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "permit2",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPermit2",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolFeeSplits",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct FeeSplit[]",
        components: [
          {
            name: "recipient",
            type: "address",
            internalType: "address",
          },
          {
            name: "bps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolKeys",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "currency0",
        type: "address",
        internalType: "Currency",
      },
      {
        name: "currency1",
        type: "address",
        internalType: "Currency",
      },
      {
        name: "fee",
        type: "uint24",
        internalType: "uint24",
      },
      {
        name: "tickSpacing",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "hooks",
        type: "address",
        internalType: "contract IHooks",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "positionManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPositionManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "protocolFeeRecipient",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sellToken",
    inputs: [
      {
        name: "buyer",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountOutMin",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setProtocolFeeRecipient",
    inputs: [
      {
        name: "_protocolFeeRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenDeploymentConfig",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "config",
        type: "tuple",
        internalType: "struct StateManager.TokenDeploymentConfig",
        components: [
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "baseToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "image",
            type: "string",
            internalType: "string",
          },
          {
            name: "appIdentifier",
            type: "string",
            internalType: "string",
          },
          {
            name: "teamSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingStartTime",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingDuration",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingWallet",
            type: "address",
            internalType: "address",
          },
          {
            name: "bondingCurveSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityPoolSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveBuyFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveSellFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "bondingCurveParams",
            type: "tuple",
            internalType: "struct PriceCurve",
            components: [
              {
                name: "prices",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "numSteps",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "stepSize",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "allowForcedGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "allowAutoGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "graduationFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "graduationFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "poolFees",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "poolFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "surgeFeeStartingTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surgeFeeDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxSurgeFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenIdRecipient",
    inputs: [
      {
        name: "_tokenIdRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stateView",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IStateView",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenDeploymentConfigs",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "creator",
        type: "address",
        internalType: "address",
      },
      {
        name: "baseToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "image",
        type: "string",
        internalType: "string",
      },
      {
        name: "appIdentifier",
        type: "string",
        internalType: "string",
      },
      {
        name: "teamSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "vestingStartTime",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "vestingDuration",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "vestingWallet",
        type: "address",
        internalType: "address",
      },
      {
        name: "bondingCurveSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "liquidityPoolSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "totalSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "bondingCurveBuyFee",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "bondingCurveSellFee",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "bondingCurveParams",
        type: "tuple",
        internalType: "struct PriceCurve",
        components: [
          {
            name: "prices",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "numSteps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stepSize",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "allowForcedGraduation",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "allowAutoGraduation",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "graduationFeeBps",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "poolFees",
        type: "uint24",
        internalType: "uint24",
      },
      {
        name: "surgeFeeStartingTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "surgeFeeDuration",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxSurgeFeeBps",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenIdRecipient",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenStates",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "isGraduated",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "tokensInBondingCurve",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "baseTokensInBondingCurve",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "poolAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "uniswapTokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BondingCurveSwap",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "isBuy",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "from",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PoolLaunched",
    inputs: [
      {
        name: "token0",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "token1",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "uniswapTokenId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenGraduated",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "mintedBondingCurveTokens",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "collectedBaseTokens",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenLaunched",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "config",
        type: "tuple",
        indexed: false,
        internalType: "struct StateManager.TokenDeploymentConfig",
        components: [
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "baseToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "image",
            type: "string",
            internalType: "string",
          },
          {
            name: "appIdentifier",
            type: "string",
            internalType: "string",
          },
          {
            name: "teamSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingStartTime",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingDuration",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "vestingWallet",
            type: "address",
            internalType: "address",
          },
          {
            name: "bondingCurveSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityPoolSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveBuyFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveSellFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "bondingCurveFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "bondingCurveParams",
            type: "tuple",
            internalType: "struct PriceCurve",
            components: [
              {
                name: "prices",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "numSteps",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "stepSize",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "allowForcedGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "allowAutoGraduation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "graduationFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "graduationFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "poolFees",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "poolFeeSplits",
            type: "tuple[]",
            internalType: "struct FeeSplit[]",
            components: [
              {
                name: "recipient",
                type: "address",
                internalType: "address",
              },
              {
                name: "bps",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "surgeFeeStartingTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surgeFeeDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxSurgeFeeBps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenReadyForGraduation",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "CurveSupplyExhausted",
    inputs: [],
  },
  {
    type: "error",
    name: "FailedToPullTokens",
    inputs: [],
  },
  {
    type: "error",
    name: "FailedToTransferTokens",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientETHSent",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientInputAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientTokenBalanceInBondingCurve",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidBondingCurveSupply",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidFeeSplits",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPriceX96",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidToken0Amount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidTokenBalance",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidTokenSupply",
    inputs: [],
  },
  {
    type: "error",
    name: "NoFeeToClaim",
    inputs: [],
  },
  {
    type: "error",
    name: "NotEnoughTokensToSell",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "PriceCurveOutOfBounds",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SlippageExceeded",
    inputs: [],
  },
  {
    type: "error",
    name: "StartTickTooLarge",
    inputs: [],
  },
  {
    type: "error",
    name: "SubByTooLarge",
    inputs: [
      {
        name: "subBy",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "sqrtTargetPrice",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "TickNotMultipleOfSpacing",
    inputs: [],
  },
  {
    type: "error",
    name: "TickTooLarge",
    inputs: [],
  },
  {
    type: "error",
    name: "TickTooSmall",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenAlreadyDeployed",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenAlreadyGraduated",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenInGraduationProcess",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenNotReadyForGraduation",
    inputs: [],
  },
  {
    type: "error",
    name: "UnexpectedCrash",
    inputs: [],
  },
] as const;
