import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

function getApiUrl(): string {
  return 'https://api.coingecko.com/api'
}

// https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x33e18a092a93ff21ad04746c7da12e35d34dc7c4&vs_currencies=usd
// Defaults
const API_NAME = 'Coingecko'

const API_BASE_URL = getApiUrl()
const API_VERSION = 'v3'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ${chainId}`)
  } else {
    return baseUrl + '/' + API_VERSION
  }
}

function _getCoinGeckoAssetPlatform(chainId: ChainId): 'ethereum' | 'xdai' | null {
  switch (chainId) {
    // Use of asset platforms - supports ethereum and xdai
    // https://api.coingecko.com/api/v3/asset_platforms
    case ChainId.MAINNET:
      return 'ethereum'
    case ChainId.GNOSIS_CHAIN:
      return 'xdai'
    case ChainId.RINKEBY:
      return null
    default:
      return null
  }
}

function _fetch(chainId: ChainId, url: string, method: 'GET' | 'POST' | 'DELETE', data?: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

// TODO: consider making these _get/_delete/_post etc reusable across apis
function _get(chainId: ChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

export interface CoinGeckoHistoricalDataParams {
  chainId: ChainId
  tokenAddress: string
  days: number
}

export interface HistoricalDataResponse {
  market_caps: Array<[timestamp: number, value: number]>
  prices: Array<[timestamp: number, value: number]>
  total_volumes: Array<[timestamp: number, value: number]>
}

export async function getHistoricalData(params: CoinGeckoHistoricalDataParams): Promise<HistoricalDataResponse | null> {
  const { chainId, tokenAddress, days } = params
  // ethereum/xdai (chains)
  const assetPlatform = _getCoinGeckoAssetPlatform(chainId)
  if (assetPlatform == null) {
    // Unsupported
    return null
  }

  console.log(`[api:${API_NAME}] Get Historical Data from ${API_NAME}`, params)
  const response = await _get(
    chainId,
    `/coins/${assetPlatform}/contract/${tokenAddress}/market_chart/?vs_currency=usd&days=${days}`,
  ).catch((error) => {
    console.error(`Error getting ${API_NAME} Historical Data:`, error)
    throw new Error(error)
  })

  return response.json()
}
