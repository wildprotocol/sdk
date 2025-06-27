import { Log as EthersLog, Interface } from "ethers";
import { Log as ViemLog } from "viem";
import { STATEMANAGER_ABI } from "../abis/statemanager-abi";
import { randomBytes } from "crypto";

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

export function generateSalt(): string {
  return "0x" + randomBytes(32).toString("hex"); // 32 bytes = 64 hex chars
}
