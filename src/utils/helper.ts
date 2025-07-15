import { Log as EthersLog, Interface } from "ethers";
import { Address, parseUnits, Log as ViemLog } from "viem";
import { STATEMANAGER_ABI } from "../abis/statemanager-abi";
import { LaunchTokenParams } from "../types";

type CompatibleLog = EthersLog | ViemLog;

export function extractEventArgument({
  logs,
  eventName,
  argumentName,
}: {
  logs: CompatibleLog[];
  eventName: string;
  argumentName: string;
}): string | null {
  const iface = new Interface(STATEMANAGER_ABI);

  for (const log of logs) {
    try {
      const parsedLog = iface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (parsedLog?.name === eventName) {
        return parsedLog.args?.[argumentName]?.toString() ?? null;
      }
    } catch {
      // skip non-matching logs
    }
  }

  return null;
}

export function generateSalt(): Address {
  const array = crypto.getRandomValues(new Uint8Array(32));
  return ("0x" +
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")) as Address;
}

export function normalizeSupplyParams(
  params: LaunchTokenParams
): LaunchTokenParams {
  const supplyFields = [
    "teamSupply",
    "bondingCurveSupply",
    "liquidityPoolSupply",
    "totalSupply",
  ] as const;

  const normalizedParams = { ...params };

  for (const key of supplyFields) {
    const raw = params[key];
    if (raw == null || raw === "") {
      throw new Error(`${key} is required and must be a valid number`);
    }

    if (typeof raw !== "string") {
      throw new Error(`${key} must be a string`);
    }

    const trimmed = raw.trim();

    if (!/^\d+(\.\d+)?$/.test(trimmed)) {
      throw new Error(`${key} must be a valid non-negative number`);
    }

    try {
      normalizedParams[key] = parseUnits(trimmed, 18).toString();
    } catch (err) {
      throw new Error(`Failed to parse ${key}: ${err}`);
    }
  }

  return normalizedParams;
}
