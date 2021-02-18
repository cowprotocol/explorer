import Web3 from 'web3'

import { MultiTcrApiProxy } from './MultiTcrApiProxy'
import { TcrApi } from './TcrApi'

export function createTcrApi(web3: Web3): TcrApi | undefined {
  const { type } = CONFIG.tcr
  let tcrApi: TcrApi | undefined
  switch (CONFIG.tcr.type) {
    case 'none':
      tcrApi = undefined
      break
    case 'multi-tcr': {
      const multiTcrApiConfig = CONFIG.tcr
      tcrApi = new MultiTcrApiProxy({ web3, ...multiTcrApiConfig.config })
      break
    }

    default:
      throw new Error('Unknown implementation for DexPriceEstimatorApi: ' + type)
  }

  window['tcrApi'] = tcrApi
  return tcrApi
}
