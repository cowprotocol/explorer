import { createDepositApi } from 'api/deposit'
import { createDexPriceEstimatorApi } from 'api/dexPriceEstimator'
import { createErc20Api } from 'api/erc20'
import { createExchangeApi } from 'api/exchange'
import { createTcrApi } from 'api/tcr'
import { createTheGraphApi } from 'api/thegraph'
import { createTokenListApi } from 'api/tokenList'
import { createWalletApi } from 'api/wallet'
import { createWeb3Api } from 'api/web3'
import { createWethApi } from 'api/weth'

// Build APIs

const web3 = createWeb3Api()

const injectedDependencies = { web3 }

const walletApi = createWalletApi(web3)
const erc20Api = createErc20Api(injectedDependencies)
const wethApi = createWethApi(injectedDependencies)
const depositApi = createDepositApi(erc20Api, injectedDependencies)
const exchangeApi = createExchangeApi(erc20Api, injectedDependencies)
const tokenListApi = createTokenListApi()
const theGraphApi = createTheGraphApi()
const dexPriceEstimatorApi = createDexPriceEstimatorApi()
const tcrApi = createTcrApi(web3)

export {
  erc20Api,
  wethApi,
  depositApi,
  exchangeApi,
  tokenListApi,
  theGraphApi,
  dexPriceEstimatorApi,
  tcrApi,
  // re-exporting to have all api instances of the app accessible from a single module
  web3,
  walletApi,
}
