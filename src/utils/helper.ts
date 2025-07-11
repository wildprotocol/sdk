import { Log as EthersLog, Interface } from "ethers";
import { Address, Log as ViemLog } from "viem";
import { STATEMANAGER_ABI } from "../abis/statemanager-abi";

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
