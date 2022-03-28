import { Network } from 'types'
import { CowSdk, ALL_SUPPORTED_CHAIN_IDS } from '@gnosis.pm/cow-sdk'

import { buildSearchString } from 'utils/url'
import { isProd, isStaging } from 'utils/env'

type SupportedChainId = typeof ALL_SUPPORTED_CHAIN_IDS[number]
import {
  GetOrderParams,
  GetAccountOrdersParams,
  GetOrdersParams,
  GetTradesParams,
  RawOrder,
  RawTrade,
  GetTxOrdersParams,
} from './types'

function getOperatorUrl(): Partial<Record<Network, string>> {
  if (isProd || isStaging) {
    return {
      [Network.Mainnet]: process.env.OPERATOR_URL_PROD_MAINNET,
      [Network.Rinkeby]: process.env.OPERATOR_URL_PROD_RINKEBY,
      [Network.xDAI]: process.env.OPERATOR_URL_PROD_XDAI,
    }
  } else {
    return {
      [Network.Mainnet]: process.env.OPERATOR_URL_STAGING_MAINNET,
      [Network.Rinkeby]: process.env.OPERATOR_URL_STAGING_RINKEBY,
      [Network.xDAI]: process.env.OPERATOR_URL_STAGING_XDAI,
    }
  }
}

const API_BASE_URL = getOperatorUrl()

const DEFAULT_HEADERS: Headers = new Headers({
  'Content-Type': 'application/json',
  'X-AppId': CONFIG.appId.toString(),
})

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */

function _getApiBaseUrl(networkId: Network): string {
  const baseUrl = API_BASE_URL[networkId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + networkId)
  } else {
    return baseUrl + '/v1'
  }
}

function _get(networkId: Network, url: string): Promise<Response> {
  const baseUrl = _getApiBaseUrl(networkId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
  })
}

/**
 * Gets a single order by id
 */
export async function getOrder(params: GetOrderParams): Promise<RawOrder | null> {
  const { networkId, orderId } = params
  const chainId = networkId as unknown as SupportedChainId
  const cowInstance = new CowSdk(chainId, { isDevEnvironment: !(isProd || isStaging) })
  return cowInstance.cowApi.getOrder(orderId)
}

/**
 * Gets a list of orders
 *
 * Optional filters:
 *  - owner: address
 *  - sellToken: address
 *  - buyToken: address
 *  - minValidTo: number
 */
export async function getOrders(params: GetOrdersParams): Promise<RawOrder[]> {
  const { networkId, ...searchParams } = params
  const { owner, sellToken, buyToken, minValidTo } = searchParams
  const defaultValues = {
    includeFullyExecuted: 'true',
    includeInvalidated: 'true',
    includeInsufficientBalance: 'true',
    includePresignaturePending: 'true',
    includeUnsupportedTokens: 'true',
  }

  console.log(
    `[getOrders] Fetching orders on network ${networkId} with filters: owner=${owner} sellToken=${sellToken} buyToken=${buyToken}`,
  )

  const searchString = buildSearchString({ ...searchParams, ...defaultValues, minValidTo: String(minValidTo) })

  const queryString = '/orders/' + searchString

  return _fetchQuery(networkId, queryString)
}

/**
 * Gets a list of orders of one user paginated
 *
 * Optional filters:
 *  - owner: address
 *  - offset: int
 *  - limit: int
 */
export async function getAccountOrders(params: GetAccountOrdersParams): Promise<RawOrder[]> {
  const { networkId, owner, offset, limit } = params
  const chainId = networkId as unknown as SupportedChainId
  const cowInstance = new CowSdk(chainId, { isDevEnvironment: !(isProd || isStaging) })
  return cowInstance.cowApi.getOrders({ owner, offset, limit })
}

/**
 * Gets a order list within Tx
 */
export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId, txHash } = params

  console.log(`[getTxOrders] Fetching tx orders on network ${networkId}`)

  const chainId = networkId as unknown as SupportedChainId
  const cowInstance = new CowSdk(chainId, { isDevEnvironment: !(isProd || isStaging) })
  return cowInstance.cowApi.getTxOrders(txHash)
}

/**
 * Gets a list of trades
 *
 * Optional filters:
 *  - owner: address
 *  - orderId: string
 *
 * Both filters cannot be used at the same time
 */
export async function getTrades(params: GetTradesParams): Promise<RawTrade[]> {
  const { networkId, owner = '' } = params
  const chainId = networkId as unknown as SupportedChainId
  const cowInstance = new CowSdk(chainId, { isDevEnvironment: !(isProd || isStaging) })

  return cowInstance.cowApi.getTrades({ owner })
}

async function _fetchQuery<T>(networkId: Network, queryString: string): Promise<T>
async function _fetchQuery<T>(networkId: Network, queryString: string, nullOn404: true): Promise<T | null>
async function _fetchQuery<T>(networkId: Network, queryString: string, nullOn404?: boolean): Promise<T | null> {
  let response

  try {
    response = await _get(networkId, queryString)
  } catch (e) {
    const msg = `Failed to fetch ${queryString}`
    console.error(msg, e)
    throw new Error(msg)
  }

  if (!response.ok) {
    // 404 is not a hard error, return null instead if `nullOn404` is set
    if (response.status === 404 && nullOn404) {
      return null
    }

    // Just in case response.text() fails
    const responseText = await response.text().catch((e) => {
      console.error(`Failed to fetch response text`, e)
      throw new Error(`Request failed`)
    })

    throw new Error(`Request failed: [${response.status}] ${responseText}`)
  }

  try {
    return response.json()
  } catch (e) {
    console.error(`Response does not have valid JSON`, e)
    throw new Error(`Failed to parse API response`)
  }
}
