import { DEPLOYER_ABI as V2_DEPLOYER_ABI } from "./v2/deployer-abi";
import { STATEMANAGER_ABI as V2_STATEMANAGER_ABI } from "./v2/statemanager-abi";
import { LP_LOCKER_ABI as V2_LP_LOCKER_ABI } from "./v2/lp-locker-abi";

import { DEPLOYER_ABI as V3_DEPLOYER_ABI } from "./v3/deployer-abi";
import { LP_LOCKER_ABI } from "./v3/lp-locker-abi";
import { STATEMANAGER_ABI as V3_STATEMANAGER_ABI } from "./v3/statemanager-abi";

export const ABIS = {
  v2: {
    DEPLOYER_ABI: V2_DEPLOYER_ABI,
    STATEMANAGER_ABI: V2_STATEMANAGER_ABI,
    LP_LOCKER_ABI: V2_LP_LOCKER_ABI,
  },
  v3: {
    DEPLOYER_ABI: V3_DEPLOYER_ABI,
    STATEMANAGER_ABI: V3_STATEMANAGER_ABI,
    LP_LOCKER_ABI: LP_LOCKER_ABI,
  },
};
