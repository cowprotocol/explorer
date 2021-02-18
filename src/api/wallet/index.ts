import Web3 from 'web3'

import WalletApiImpl, { WalletApi } from './WalletApi'
import WalletApiMock from './WalletApiMock'

export function createWalletApi(web3: Web3): WalletApi {
  let walletApi
  if (process.env.MOCK_WALLET === 'true') {
    walletApi = new WalletApiMock()
  } else {
    walletApi = new WalletApiImpl(web3)
  }
  window['walletApi'] = walletApi // register for convenience
  return walletApi
}
