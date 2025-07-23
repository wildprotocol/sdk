import { useEffect, useState } from "react";
import { DeployerSDK } from "../deployer-sdk";
import { SDKConfig } from "../types";
import { EthersDeployer } from "../clients/ethers";
import { ViemDeployer } from "../clients/viem";

type DeployerType<T extends SDKConfig> = T["client"] extends "ethers"
  ? EthersDeployer
  : ViemDeployer;

export function useDeployerSDK<T extends SDKConfig>(config: T) {
  const [sdk, setSdk] = useState<DeployerType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      setIsLoading(true);
      try {
        // Optional: warn only if writing is intended without wallet
        if (config.client === "viem" && !config.walletClient) {
          console.warn(
            "[useDeployerSDK] viem client initialized without walletClient. Only read operations will be available."
          );
        }
        if (config.client === "ethers" && !config.signer) {
          console.warn(
            "[useDeployerSDK] ethers client initialized without signer. Only read operations will be available."
          );
        }

        const deployer = await DeployerSDK.getDeployer(config);
        setSdk(deployer as DeployerType<T>);
      } catch (err) {
        console.error("Error initializing SDK:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initSDK();
  }, [
    config.client,
    config.network,
    config.rpcUrl,
    ...(config.client === "viem" ? [config.walletClient] : []), // Track walletClient for viem only
    ...(config.client === "ethers" ? [config.signer] : []), // Track walletClient for ethers only
  ]);

  return { sdk, isLoading, error };
}
