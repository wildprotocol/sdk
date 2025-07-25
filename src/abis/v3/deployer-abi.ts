export const DEPLOYER_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_stateView",
        type: "address",
        internalType: "address",
      },
      {
        name: "_lplocker",
        type: "address",
        internalType: "address",
      },
      {
        name: "_universalRouter",
        type: "address",
        internalType: "address",
      },
      {
        name: "_permit2",
        type: "address",
        internalType: "address",
      },
      {
        name: "_poolManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "_quoter",
        type: "address",
        internalType: "address",
      },
      {
        name: "_owner",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "MIN_VESTING_START_TIME",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_validateTokenDeploymentConfig",
    inputs: [
      {
        name: "tokenDeploymentConfig",
        type: "tuple",
        internalType: "struct TokenDeploymentConfig",
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
      {
        name: "salt",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
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
    name: "appIdentifiers",
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
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buyQuote",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyToken",
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
    outputs: [],
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
    name: "emergencyEjectToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "finalizeEmergencyRescue",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "uniswapTokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "poolKey",
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
    outputs: [],
    stateMutability: "nonpayable",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isBaseTokenWhitelisted",
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
    name: "launchToken",
    inputs: [
      {
        name: "tokenDeploymentConfig",
        type: "tuple",
        internalType: "struct TokenDeploymentConfig",
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
      {
        name: "salt",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
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
    name: "lplocker",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ILpLockerWithOwnable",
      },
    ],
    stateMutability: "view",
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
    name: "poolManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPoolManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "predictTokenAddress",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "salt",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
      {
        name: "exists",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quoter",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IV4Quoter",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "relinquishStateManager",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "sellQuote",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sellToken",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAppIdentifier",
    inputs: [
      {
        name: "creator",
        type: "address",
        internalType: "address",
      },
      {
        name: "appIdentifier",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBaseTokenWhitelist",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "whitelisted",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
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
    name: "stateManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract StateManager",
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
    type: "function",
    name: "universalRouter",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IUniversalRouter",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updateTokenFeeSplits",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "feeUpdate",
        type: "tuple",
        internalType: "struct Deployer.TokenFeeUpdate",
        components: [
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
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistedBaseTokens",
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
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawFunds",
    inputs: [
      {
        name: "destination",
        type: "address",
        internalType: "address",
      },
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
    type: "event",
    name: "BaseTokenWhitelisted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "whitelisted",
        type: "bool",
        indexed: false,
        internalType: "bool",
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
    type: "error",
    name: "BothTokensLaunched",
    inputs: [],
  },
  {
    type: "error",
    name: "ETHBalanceTooLowForSwap",
    inputs: [],
  },
  {
    type: "error",
    name: "ETHTransferFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectETHAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientOutputAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidBaseToken",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidCaller",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidCurveParameters",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidTokenDetails",
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
    name: "QuoteAmount",
    inputs: [
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "effectiveAmountIn",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "QuoteNotImplemented",
    inputs: [],
  },
  {
    type: "error",
    name: "Reentrancy",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenAlreadyLaunched",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenNotLaunched",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenStateNotSet",
    inputs: [],
  },
] as const;
