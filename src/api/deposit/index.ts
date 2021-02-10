import { Erc20Api } from 'api/erc20/Erc20Api'

import { DepositApi, DepositApiDependencies } from './DepositApi'
import { DepositApiMock } from './DepositApiMock'
import { DepositApiProxy } from './DepositApiProxy'

import { exchangeBalanceStates } from '../../../test/data'

export function createDepositApi(erc20Api: Erc20Api, injectedDependencies: DepositApiDependencies): DepositApi {
  let depositApi
  if (process.env.MOCK_DEPOSIT === 'true') {
    depositApi = new DepositApiMock(exchangeBalanceStates, erc20Api)
  } else {
    depositApi = new DepositApiProxy(injectedDependencies)
  }
  window['depositApi'] = depositApi // register for convenience
  return depositApi
}
