import { Network } from 'types'

import TokenListApiImpl, { TokenList } from './TokenListApi'
import TokenListApiMock from './TokenListApiMock'

import { tokenList } from '../../../test/data'

export function createTokenListApi(): TokenList {
  const networkIds = [Network.Mainnet, Network.Rinkeby, Network.xDAI]

  let tokenListApi: TokenList
  if (process.env.MOCK_TOKEN_LIST === 'true') {
    tokenListApi = new TokenListApiMock(tokenList)
  } else {
    tokenListApi = new TokenListApiImpl({ networkIds, initialTokenList: CONFIG.initialTokenList })
  }

  window['tokenListApi'] = tokenListApi // register for convenience
  return tokenListApi
}
