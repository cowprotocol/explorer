import { DexPriceEstimatorApi } from './DexPriceEstimatorApi'
import { DexPriceEstimatorApiProxy } from './DexPriceEstimatorApiProxy'

export function createDexPriceEstimatorApi(): DexPriceEstimatorApi {
  const { type, config } = CONFIG.dexPriceEstimator
  let dexPriceEstimatorApi: DexPriceEstimatorApi
  switch (type) {
    case 'dex-price-estimator':
      dexPriceEstimatorApi = new DexPriceEstimatorApiProxy(config)
      break

    default:
      throw new Error('Unknown implementation for DexPriceEstimatorApi: ' + type)
  }

  window['dexPriceEstimatorApi'] = dexPriceEstimatorApi
  return dexPriceEstimatorApi
}
