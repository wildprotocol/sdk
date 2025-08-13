import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Check, Loader2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  erc20Abi,
  formatUnits,
  getContract,
  type Address,
  type PublicClient,
} from "viem";
import { useAccount, useBalance } from "wagmi";
import {
  calculateSlippage,
  dummyEthOnBase,
  formatNumberMagnitude,
} from "./Utils";
import { Avatar, AvatarFallback, AvatarImage } from "./components/Avatar";
import useSwapStore from "./store/swap-store";
import { TokenData } from "./types";

interface SwapProps {
  inputToken: TokenData | null;
  outputToken: TokenData | null;
  sdk: any;
  client: PublicClient;
  WalletConnectButton: React.ComponentType;
  theme?: Theme;
  onSwapComplete: (result: { status: string; txHash: string | null }) => void;
}

interface Theme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  secondaryTextColor?: string;
  btnTextColor?: string;
  tokenTextColor?: string;
  loaderColor?: string;
}

interface SwapStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
  transactionHash: string | null;
}

const DEFAULT_THEME: Theme = {
  primaryColor: "#2648DD",
  secondaryColor: "#1433BF",
  backgroundColor: "#151515",
  textColor: "#A6A0BB",
  secondaryTextColor: "#898989",
  borderColor: "#3a3a3a",
  btnTextColor: "#ffffff",
  tokenTextColor: "#ffffff",
  loaderColor: "#ffffffb5",
};

export function Swap({
  inputToken = dummyEthOnBase,
  outputToken,
  client,
  sdk,
  WalletConnectButton,
  theme,
  onSwapComplete,
}: SwapProps) {
  const { address, isConnected } = useAccount();
  const { data: walletBalance, isLoading: isLoadingWalletBalance } = useBalance(
    { address }
  );
  const {
    inputTokenStore,
    outputTokenStore,
    tokenAmount: inputTokenAmount,
    setInputToken,
    setOutputToken,
    setTokenAmount,
    swapTokens,
  } = useSwapStore();

  useEffect(() => {
    if (!outputToken) return;
    setOutputToken(outputToken!);

    return () => {
      if (inputToken?.token === dummyEthOnBase.token) return;
      setInputToken(dummyEthOnBase);
      setTokenAmount("0.001");
      setOutputToken(null);
    };
  }, [outputToken]);

  const [debouncedValue] = useDebounce(inputTokenAmount, 1000);

  const [swapStatus, setSwapStatus] = useState<SwapStatus>({
    loading: false,
    error: null,
    success: false,
    transactionHash: null,
  });

  const [ethPrice, setEthPrice] = useState(0);
  const [isLoadingETHPrice, setIsLoadingETHPrice] = useState(false);
  const [balances, setBalances] = useState<Record<Address, string>>({});

  const isEthInput = useMemo(() => {
    return inputTokenStore?.config.symbol === "ETH";
  }, [inputTokenStore]);

  const isETHBaseToken = useMemo(
    () =>
      outputToken?.config.baseToken ===
      "0x0000000000000000000000000000000000000000",
    [outputTokenStore]
  );

  const { data: buyQuote, isLoading: isLoadingBuyQuote } = useQuery({
    queryKey: ["buyQuote", debouncedValue, outputTokenStore?.token, sdk],
    queryFn: async () => {
      const res = await sdk?.read.getBuyQuote(
        outputTokenStore?.token,
        debouncedValue
      );

      return res;
    },
    enabled:
      isEthInput && !!debouncedValue && !!outputTokenStore?.token && !!sdk,
  });

  const { data: sellQuote, isLoading: isLoadingSellQuote } = useQuery({
    queryKey: ["sellQuote", debouncedValue, inputTokenStore?.token, sdk],
    queryFn: async () => {
      const res = await sdk?.read.getSellQuote(
        inputTokenStore?.token,
        debouncedValue
      );

      return res;
    },
    enabled:
      !isEthInput && !!debouncedValue && !!inputTokenStore?.token && !!sdk,
  });

  const { data: buyQuotreference, isLoading: isLoadingBuyQuoteSmallestWei } =
    useQuery({
      queryKey: [
        "buyQuoteSmallestWei",
        outputTokenStore?.token,
        "0.000000001",
        sdk,
        inputTokenStore?.config.symbol,
      ],
      queryFn: async () => {
        return await sdk?.read.getBuyQuote(
          outputTokenStore?.token,
          "0.000000001"
        );
      },
      enabled:
        isEthInput &&
        !!outputTokenStore?.token &&
        !!sdk &&
        !!inputTokenStore?.config.symbol,
    });

  const { data: sellQuotreference, isLoading: isLoadingSellQuoteSmallestWei } =
    useQuery({
      queryKey: [
        "buyQuoteSmallestWei",
        inputTokenStore?.token,
        "0.000000001",
        sdk,
        outputTokenStore?.config.symbol,
      ],
      queryFn: async () => {
        return await sdk?.read.getSellQuote(
          inputTokenStore?.token,
          "0.000000001"
        );
      },
      enabled:
        !isEthInput &&
        !!inputTokenStore?.token &&
        !!sdk &&
        !!outputTokenStore?.config.symbol,
    });

  const { data: slippage, isLoading: isLoadingSlippage } = useQuery({
    queryKey: [
      "slippage",
      isEthInput ? inputTokenStore?.token : outputTokenStore?.token,
      Number(inputTokenAmount)?.toString(),
      buyQuote?.amountOut?.toString(),
      buyQuotreference?.amountOut?.toString(),
      sellQuote?.amountOut?.toString(),
    ],
    enabled: !!buyQuote?.amountOut && !!buyQuotreference?.amountOut,
    queryFn: () => {
      return calculateSlippage({
        actualQuote: isEthInput ? buyQuote?.amountOut! : sellQuote?.amountOut!,
        referenceQuote: isEthInput
          ? buyQuotreference?.amountOut!
          : sellQuote?.amountOut!,
        inputEthAmount: Number(inputTokenAmount)?.toString(),
        referenceEth: "0.0000000001",
        tokenDecimals: 18,
      });
    },
    staleTime: 30 * 1000, // cache for 30s
  });

  const fetchBalance = useCallback(
    async (token: Address, user: Address) => {
      const contract = getContract({
        address: token,
        abi: erc20Abi,
        client,
      });

      const [rawBalance, decimals] = await Promise.all([
        contract.read.balanceOf([user]),
        contract.read.decimals(),
      ]);

      const formatted = formatUnits(rawBalance, decimals);
      setBalances((prev) => ({
        ...prev,
        [token]: formatted,
      }));
      return formatted;
    },
    [client, sdk]
  );

  const handleBuySellToken = useCallback(
    async (type: string) => {
      if (!sdk || !address) {
        toast.error("SDK or wallet is not available");
        return;
      }
      setSwapStatus({
        loading: true,
        error: null,
        success: false,
        transactionHash: null,
      });

      switch (type) {
        case "buy":
          {
            try {
              const res = await sdk?.write.buyToken({
                amountIn: inputTokenAmount,
                token: outputTokenStore?.token,
                amountOutMin: "0",
                to: address as Address,
              });
              setSwapStatus({
                loading: false,
                error: null,
                success: true,
                transactionHash: res.hash,
              });
              onSwapComplete({ status: "success", txHash: res.hash });
              toast.custom(() => (
                <SwapToast type="Bought" trxHash={res.hash} />
              ));
            } catch (err) {
              console.log("Error buying token", err);
              toast.error("Error buying token");
              setSwapStatus({
                loading: false,
                error: "Error buying token",
                success: false,
                transactionHash: null,
              });
              onSwapComplete({ status: "failed", txHash: null });
            } finally {
              fetchBalance(inputTokenStore?.token as Address, address);
              fetchBalance(outputTokenStore?.token as Address, address);
            }
          }
          break;
        case "sell":
          {
            try {
              const res = await sdk!.write.approveAndSell({
                amountIn: inputTokenAmount,
                token: inputTokenStore?.token,
                amountOutMin: "0",
                to: address as Address,
              });
              setSwapStatus({
                loading: false,
                error: null,
                success: true,
                transactionHash: res.hash,
              });
              toast.custom(() => <SwapToast type="Sold" trxHash={res.hash} />);
              onSwapComplete({ status: "success", txHash: res.hash });
            } catch {
              toast.error("Error selling token");
              setSwapStatus({
                loading: false,
                error: "Error selling token",
                success: false,
                transactionHash: null,
              });
              onSwapComplete({ status: "failed", txHash: null });
            } finally {
              fetchBalance(inputTokenStore?.token as Address, address);
              fetchBalance(outputTokenStore?.token as Address, address);
            }
          }
          break;
        default:
          break;
      }
    },
    [
      sdk,
      inputTokenStore,
      outputTokenStore,
      inputTokenAmount,
      address,
      client,
      fetchBalance,
    ]
  );

  useEffect(() => {
    if (!client || !address) return;
    const fetchEthPrice = async () => {
      setIsLoadingETHPrice(true);
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        const ethUsd = data?.ethereum?.usd;
        if (ethUsd === undefined) {
          throw new Error("Failed to fetch ETH price");
        }
        if (isNaN(ethUsd)) {
          throw new Error("Invalid ETH price fetched");
        }
        const formattedEthUsd = ethUsd.toFixed(2);
        setEthPrice(formattedEthUsd);
      } catch (err) {
        console.error("ETH Price fetch failed", err);
      } finally {
        setIsLoadingETHPrice(false);
      }
    };
    fetchEthPrice();

    if (inputTokenStore?.token) fetchBalance(inputTokenStore.token, address);
    if (outputTokenStore?.token) fetchBalance(outputTokenStore.token, address);
  }, [client, sdk, inputTokenStore, outputTokenStore, address, fetchBalance]);

  const insufficientFunds = useMemo(() => {
    if (!inputTokenStore || !inputTokenAmount) return false;
    const inputAmount = parseFloat(debouncedValue);
    const rawBalance =
      inputTokenStore?.token === "0x4200000000000000000000000000000000000006"
        ? walletBalance
        : balances[inputTokenStore.token as Address];
    const tokenBalance = parseFloat(rawBalance?.toString() || "0");
    return parseFloat(inputTokenAmount) > tokenBalance;
  }, [inputTokenStore, inputTokenAmount, balances, walletBalance]);

  return (
    <div className="w-full flex-1">
      <div
        className="relative border-[0.1px] rounded-2xl py-3 px-4"
        style={{
          backgroundColor:
            theme?.backgroundColor || DEFAULT_THEME.backgroundColor,
          borderColor: theme?.borderColor || DEFAULT_THEME.borderColor,
        }}
      >
        {/* INPUT TOKEN */}
        <div className="flex justify-between items-center w-full">
          <div className="w-[60%]">
            <input
              value={inputTokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="bg-transparent w-full placeholder:text-[#bbb5d1] text-3xl font-semibold outline-none"
              placeholder="0.1"
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              style={{
                color: theme?.textColor || DEFAULT_THEME.textColor,
              }}
            />
            <div
              className="flex items-center gap-1 text-sm font-medium"
              style={{
                color:
                  theme?.secondaryTextColor || DEFAULT_THEME.secondaryTextColor,
              }}
            >
              Balance:{" "}
              {inputTokenStore?.config.symbol === "ETH" ? (
                isLoadingWalletBalance ? (
                  <div
                    className="h-[16px] w-10 rounded-xl animate-pulse"
                    style={{
                      background:
                        theme?.loaderColor || DEFAULT_THEME.loaderColor,
                    }}
                  ></div>
                ) : (
                  (walletBalance &&
                    parseFloat(walletBalance?.formatted!).toFixed(2)) ||
                  "0.00"
                )
              ) : (
                <p>
                  {(balances[inputTokenStore?.token as Address] &&
                    formatNumberMagnitude(
                      Number(balances[inputTokenStore?.token as Address])
                    )) ||
                    "0.00"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="size-7 rounded-full overflow-hidden">
              <AvatarImage
                src={inputTokenStore?.config.image}
                alt={inputTokenStore?.config.name}
                className={`transition-transform w-7 h-7 rounded-full`}
              />
              <AvatarFallback className="bg-gray-600 text-white text-base rounded-xl flex items-center justify-center">
                {inputTokenStore?.config.name?.[0]}
              </AvatarFallback>
            </Avatar>

            <p
              className="font-semibold text-sm truncate"
              style={{
                color: theme?.tokenTextColor || DEFAULT_THEME.tokenTextColor,
              }}
            >
              {inputTokenStore?.config.symbol}
            </p>
          </div>
        </div>
        {/* Swap Button */}
        {/* <div className="flex justify-center items-center my-2">
          <div className="h-[1px] bg-gradient-to-r from-black/70 to-[#2648DD] bg-[#2648DD] w-full" />
          <button
            onClick={swapTokens}
            className="bg-[#2648DD] hover:bg-[#2648dde5] rounded-full size-11 min-h-11 min-w-11 flex justify-center items-center"
          >
            <ArrowUpDown size={20} className="text-white" />
          </button>
          <div className="h-[1px] bg-gradient-to-r from-[#2648DD] to-black/70 bg-[#2648DD] w-full" />
        </div> */}

        <div className="flex justify-center items-center my-2">
          <div
            style={{
              height: "1px",
              width: "100%",
              backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7), ${theme?.primaryColor || DEFAULT_THEME.primaryColor})`,
              backgroundColor:
                theme?.primaryColor || DEFAULT_THEME.primaryColor,
            }}
          />
          <button
            onClick={swapTokens}
            style={{
              backgroundColor:
                theme?.primaryColor || DEFAULT_THEME.primaryColor,
              borderRadius: "9999px",
              width: "2.75rem",
              height: "2.75rem",
              minWidth: "2.75rem",
              minHeight: "2.75rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = `${theme?.primaryColor || DEFAULT_THEME.primaryColor}e5`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                theme?.primaryColor || DEFAULT_THEME.primaryColor!)
            }
          >
            <ArrowUpDown size={20} color="white" />
          </button>
          <div
            style={{
              height: "1px",
              width: "100%",
              backgroundImage: `linear-gradient(to right, ${theme?.primaryColor || DEFAULT_THEME.primaryColor}, rgba(0, 0, 0, 0.7))`,
              backgroundColor:
                theme?.primaryColor || DEFAULT_THEME.primaryColor,
            }}
          />
        </div>

        {/* OUTPUT TOKEN */}
        <div className="flex justify-between items-center w-full">
          <div className="w-[60%]">
            {inputTokenStore?.config.symbol === "ETH" ? (
              isLoadingBuyQuote ? (
                <div
                  className="h-9 w-36 rounded-xl animate-pulse"
                  style={{
                    background: theme?.loaderColor || DEFAULT_THEME.loaderColor,
                  }}
                ></div>
              ) : (
                <input
                  value={
                    buyQuote
                      ? formatNumberMagnitude(
                          Number(
                            formatUnits(
                              buyQuote?.amountOut,
                              isETHBaseToken ? 18 : 6
                            )
                          )
                        )
                      : ""
                  }
                  className="bg-transparent w-full placeholder:text-[#bbb5d1] text-3xl font-semibold outline-none"
                  placeholder="0"
                  disabled
                  style={{
                    color: theme?.textColor || DEFAULT_THEME.textColor,
                  }}
                />
              )
            ) : isLoadingSellQuote ? (
              <div
                className="h-9 w-36 rounded-xl animate-pulse"
                style={{
                  background: theme?.loaderColor || DEFAULT_THEME.loaderColor,
                }}
              ></div>
            ) : (
              <input
                value={
                  sellQuote
                    ? formatNumberMagnitude(
                        Number(
                          formatUnits(
                            sellQuote?.amountOut,
                            isETHBaseToken ? 18 : 6
                          )
                        )
                      )
                    : ""
                }
                className="bg-transparent w-full placeholder:text-[#bbb5d1] text-3xl font-semibold outline-none"
                placeholder="0"
                disabled
                style={{
                  color: theme?.textColor || DEFAULT_THEME.textColor,
                }}
              />
            )}
            <div
              className=" text-sm font-medium flex items-center gap-1"
              style={{
                color:
                  theme?.secondaryTextColor || DEFAULT_THEME.secondaryTextColor,
              }}
            >
              Balance:{" "}
              {inputTokenStore?.config.symbol !== "ETH" ? (
                isLoadingWalletBalance ? (
                  <div
                    className="h-[16px] w-10 rounded-xl animate-pulse"
                    style={{
                      background:
                        theme?.loaderColor || DEFAULT_THEME.loaderColor,
                    }}
                  ></div>
                ) : (
                  (walletBalance &&
                    parseFloat(walletBalance?.formatted!).toFixed(2)) ||
                  "0.00"
                )
              ) : (
                <p>
                  {(balances[outputTokenStore?.token as Address] &&
                    formatNumberMagnitude(
                      Number(balances[outputTokenStore?.token as Address])
                    )) ||
                    "0.00"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="size-7 rounded-full overflow-hidden">
              <AvatarImage
                src={outputTokenStore?.config.image}
                alt={outputTokenStore?.config.name}
                className={`transition-transform w-7 h-7 rounded-full`}
              />
              <AvatarFallback className="bg-gray-600 text-white text-base rounded-xl flex items-center justify-center">
                {outputTokenStore?.config.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <p
              className="font-semibold text-sm truncate"
              style={{
                color: theme?.tokenTextColor || DEFAULT_THEME.tokenTextColor,
              }}
            >
              {outputTokenStore?.config.symbol}
            </p>
          </div>
        </div>
      </div>
      {/* SLIPPAGE */}
      <div className="flex flex-wrap justify-between items-center mt-2">
        <div
          className="text-[13px] flex gap-1 items-center"
          style={{
            color:
              theme?.secondaryTextColor || DEFAULT_THEME.secondaryTextColor,
          }}
        >
          Slippage:{" "}
          {isLoadingSlippage ? (
            <div
              className="h-3 w-7 animate-pulse rounded-lg"
              style={{
                background: theme?.loaderColor || DEFAULT_THEME.loaderColor,
              }}
            />
          ) : (
            slippage?.toFixed(2) || "0.00"
          )}
          %
        </div>
        <div className="text-[13px] flex gap-1 text-white">
          1 {inputTokenStore?.config.symbol} ={" "}
          <div className="text-white flex items-center gap-1">
            {isEthInput ? (
              isLoadingBuyQuoteSmallestWei ? (
                <p
                  className="h-[14px] w-14 animate-pulse rounded-full"
                  style={{
                    background: theme?.loaderColor || DEFAULT_THEME.loaderColor,
                  }}
                ></p>
              ) : (
                formatNumberMagnitude(
                  Number(buyQuotreference?.amountOut ?? 0) /
                    Number(buyQuotreference?.amountInUsed ?? 1)
                ) || "0.00"
              )
            ) : isLoadingSellQuoteSmallestWei ? (
              <p
                className="h-[14px] w-14 animate-pulse rounded-full"
                style={{
                  background: theme?.loaderColor || DEFAULT_THEME.loaderColor,
                }}
              ></p>
            ) : (
              formatNumberMagnitude(
                Number(sellQuotreference?.amountOut ?? 0) /
                  Number(sellQuotreference?.amountInUsed ?? 1)
              ) || "0.00"
            )}{" "}
            <p>{outputTokenStore?.config.symbol}</p>
            <p
              style={{
                color:
                  theme?.secondaryTextColor || DEFAULT_THEME.secondaryTextColor,
              }}
            >
              {isLoadingETHPrice ? (
                <p
                  className="h-[14px] w-14 animate-pulse rounded-full"
                  style={{
                    background: theme?.loaderColor || DEFAULT_THEME.loaderColor,
                  }}
                ></p>
              ) : (
                <p>(${ethPrice})</p>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 w-full">
        {!isConnected ? (
          <WalletConnectButton />
        ) : (
          <button
            onClick={() => {
              if (!inputTokenStore || !outputTokenStore || !inputTokenAmount) {
                toast.error("Please select tokens and enter an amount");
                return;
              }

              if (inputTokenStore.config.symbol === "ETH") {
                handleBuySellToken("buy");
              } else {
                handleBuySellToken("sell");
              }
            }}
            className="w-full text-white h-full rounded-lg py-2 flex justify-center items-center"
            disabled={
              swapStatus.loading ||
              insufficientFunds ||
              !inputTokenStore ||
              !outputTokenStore ||
              !inputTokenAmount
            }
            style={{
              backgroundColor:
                theme?.primaryColor || DEFAULT_THEME.primaryColor,
              color: theme?.btnTextColor || DEFAULT_THEME.btnTextColor,
            }}
          >
            {swapStatus.loading ? (
              <div className="flex justify-center items-center w-full">
                <Loader2 className="animate-spin text-white" />
              </div>
            ) : insufficientFunds ? (
              "Insufficient Funds"
            ) : (
              "Swap"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const SwapToast = memo(
  ({ type, trxHash }: { type: string; trxHash: string }) => {
    return (
      <div className="bg-[#151515] border border-white/10 p-4 rounded-lg shadow-lg flex items-center gap-1">
        <div className="bg-green-600 rounded-full flex justify-center items-center p-[1.2px] mr-1">
          <Check className="text-white" size={12} />
        </div>
        <p className="text-white text-xs">Token {type} successfully!</p>
        <a
          href={`https://basescan.org/tx/${trxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-xs"
        >
          View Transaction
        </a>
      </div>
    );
  }
);
