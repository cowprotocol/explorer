import { Network } from 'types'

import TokenListApiImpl, { TokenList } from './TokenListApi'
import TokenListApiMock from './TokenListApiMock'

import { tokenList } from '../../../test/data'

export function createTokenListApi(): TokenList {
  const networkIds = [Network.MAINNET, Network.RINKEBY, Network.GNOSIS_CHAIN]

  let tokenListApi: TokenList
  if (process.env.MOCK_TOKEN_LIST === 'true') {
    tokenListApi = new TokenListApiMock(tokenList)
  } else {
    tokenListApi = new TokenListApiImpl({ networkIds, initialTokenList: CONFIG.initialTokenList })
  }

  window['tokenListApi'] = tokenListApi // register for convenience
  return tokenListApi
}
