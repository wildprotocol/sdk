import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TokenData } from "../types";
import { dummyEthOnBase } from "../Utils";

interface SwapStore {
  tokenAmount: string;
  inputTokenStore: TokenData | null;
  outputTokenStore: TokenData | null;
  selectedToken: TokenData | null;

  setTokenAmount: (amount: string) => void;
  setInputToken: (token: TokenData) => void;
  setOutputToken: (token: TokenData | null) => void;
  swapTokens: () => void;
  resetSwap: () => void;
  setSelectedToken: (token: TokenData | null) => void;

  setSwapStore: (partial: Partial<SwapStore>) => void;
}

const useSwapStore = create<SwapStore>()(
  persist(
    (set, get) => ({
      tokenAmount: "0.001",
      inputTokenStore: dummyEthOnBase,
      outputTokenStore: null,
      selectedToken: null,

      setTokenAmount: (amount) => set({ tokenAmount: amount }),
      setInputToken: (token) => set({ inputTokenStore: token }),
      setOutputToken: (token) => set({ outputTokenStore: token }),

      swapTokens: () => {
        const { inputTokenStore, outputTokenStore } = get();
        set({
          inputTokenStore: outputTokenStore,
          outputTokenStore: inputTokenStore,
        });
      },

      resetSwap: () =>
        set({
          tokenAmount: "",
          inputTokenStore: null,
          outputTokenStore: null,
        }),

      setSelectedToken: (token) => set({ selectedToken: token }),
      setSwapStore: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    {
      name: "swap-store",
      partialize: (state) => ({
        tokenAmount: state.tokenAmount,
        inputTokenStore: state.inputTokenStore,
        outputTokenStore: state.outputTokenStore,
        selectedToken: state.selectedToken,
      }),
    }
  )
);

export default useSwapStore;
