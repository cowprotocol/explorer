import { WethApi, WethApiDependencies, WethApiImpl } from './WethApi'
import { WethApiMock } from './WethApiMock'

export function createWethApi(injectedDependencies: WethApiDependencies): WethApi {
  let wethApi
  if (process.env.MOCK_WETH === 'true') {
    wethApi = new WethApiMock()
  } else {
    wethApi = new WethApiImpl(injectedDependencies)
  }
  window['wethApi'] = wethApi // register for convenience

  return wethApi
}
