import { DepositApiDependencies } from 'api/deposit/DepositApi'
import { Erc20Api } from 'api/erc20/Erc20Api'

import { ExchangeApi } from './ExchangeApi'
import ExchangeApiMock from './ExchangeApiMock'
import { ExchangeApiProxy } from './ExchangeApiProxy'

import { tokenList, exchangeBalanceStates, FEE_TOKEN, exchangeOrders, TOKEN_8 } from '../../../test/data'

export function createExchangeApi(erc20Api: Erc20Api, injectedDependencies: DepositApiDependencies): ExchangeApi {
  let exchangeApi
  if (process.env.MOCK_EXCHANGE === 'true') {
    const tokens = [FEE_TOKEN, ...tokenList.map((token) => token.address), TOKEN_8]
    exchangeApi = new ExchangeApiMock({
      balanceStates: exchangeBalanceStates,
      erc20Api,
      registeredTokens: tokens,
      ordersByUser: exchangeOrders,
    })
  } else {
    exchangeApi = new ExchangeApiProxy({
      ...injectedDependencies,
      contractsDeploymentBlocks: CONFIG.exchangeContractConfig.config,
    })
  }
  window['exchangeApi'] = exchangeApi
  return exchangeApi
}
