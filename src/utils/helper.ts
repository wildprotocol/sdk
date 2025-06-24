import { Log as EthersLog, Interface } from 'ethers';
import { Log as ViemLog } from 'viem';
import { DEPLOYER_ABI } from '../abis/deployer-abi';

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
  const iface = new Interface(DEPLOYER_ABI);

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
