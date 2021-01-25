import {
  createDepositApi,
  createDexPriceEstimatorApi,
  createErc20Api,
  createExchangeApi,
  createTcrApi,
  createTheGraphApi,
  createTokenListApi,
  createWethApi,
  walletApi,
  web3,
} from 'api'

// Build APIs

const injectedDependencies = { web3 }

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
