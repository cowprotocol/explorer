import { TheGraphApiImplParams } from 'api/thegraph/TheGraphApi'
import { MultiTcrApiParams } from 'api/tcr/MultiTcrApi'
import { DexPriceEstimatorParams } from 'api/dexPriceEstimator/DexPriceEstimatorApi'
import { ContractDeploymentBlock } from 'api/exchange/ExchangeApi'
import { Network } from 'types'
import { TokenDetailsConfigLegacy } from '@gnosis.pm/dex-js'

interface BaseTokenSelection {
  sellToken: string
  receiveToken: string
}

export type TokenSelection = BaseTokenSelection & {
  networks: {
    [n in Network]?: BaseTokenSelection
  }
}

export interface MultiTcrConfig {
  type: 'multi-tcr'
  config: Omit<MultiTcrApiParams, 'web3'>
}

export interface NoTcrConfig {
  type: 'none'
}

export interface DexPriceEstimatorConfig {
  type: 'dex-price-estimator'
  config: DexPriceEstimatorParams
}

export interface TheGraphApiConfig {
  type: 'the-graph'
  config: TheGraphApiImplParams
}

export interface InfuraProviderConfig {
  type: 'infura'
  config: { infuraId: string; infuraEndpoint: string }
}

export interface UrlProviderConfig {
  type: 'url'
  config: { ethNodeUrl: string }
}

export interface ExchangeContractConfig {
  type: 'contractBlock'
  config: ContractDeploymentBlock[]
}

export interface WalletConnectConfig {
  bridge: string
}

export interface TokenOverride {
  address: string
  symbol?: string
  name?: string
  reason?: string
  description?: string
  url?: string
}

export interface DisabledTokens {
  [Network.MAINNET]: TokenOverride[]
  [Network.GNOSIS_CHAIN]: TokenOverride[]
}

export interface Config {
  appId: number
  name: string
  logoPath: string
  templatePath: string
  initialTokenSelection: TokenSelection
  initialTokenList: TokenDetailsConfigLegacy[]
  tcr: MultiTcrConfig | NoTcrConfig
  dexPriceEstimator: DexPriceEstimatorConfig
  theGraphApi: TheGraphApiConfig
  defaultProviderConfig: InfuraProviderConfig | UrlProviderConfig
  exchangeContractConfig: ExchangeContractConfig
  walletConnect: WalletConnectConfig
  disabledTokens: DisabledTokens
}

export interface AddressToOverrideMap {
  [key: string]: TokenOverride | undefined
}

export interface DisabledTokensMaps {
  [k: number]: AddressToOverrideMap | undefined
}
