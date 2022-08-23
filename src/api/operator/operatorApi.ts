import { GetTradesParams } from '@cowprotocol/cow-sdk'
import { Network } from 'types'
import { COW_SDK } from 'const'
import { buildSearchString } from 'utils/url'
import { environmentName, Envs, isProd, isStaging } from 'utils/env'

import {
  GetOrderParams,
  GetAccountOrdersParams,
  GetOrdersParams,
  RawOrder,
  RawTrade,
  GetTxOrdersParams,
  WithNetworkId,
} from './types'
import { fetchQuery } from 'api/baseApi'

// TODO: export this through the sdk
export type ApiEnv = 'prod' | 'staging'

function explorerToApiEnv(explorerEnv?: Envs): ApiEnv {
  switch (explorerEnv) {
    case 'production':
    case 'staging':
      return 'prod'
    case 'development':
    case 'barn':
      return 'staging'
    default:
      return 'prod'
  }
}

function getOperatorUrl(): Partial<Record<Network, string>> {
  if (isProd || isStaging) {
    return {
      [Network.MAINNET]: process.env.OPERATOR_URL_PROD_MAINNET,
      [Network.RINKEBY]: process.env.OPERATOR_URL_PROD_RINKEBY,
      [Network.GNOSIS_CHAIN]: process.env.OPERATOR_URL_PROD_XDAI,
    }
  } else {
    return {
      [Network.MAINNET]: process.env.OPERATOR_URL_STAGING_MAINNET,
      [Network.RINKEBY]: process.env.OPERATOR_URL_STAGING_RINKEBY,
      [Network.GNOSIS_CHAIN]: process.env.OPERATOR_URL_STAGING_XDAI,
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

  return COW_SDK.cowApi.getOrder(orderId, { chainId: networkId })
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
  // since we are not merging responses yet, we fix the sdk env to the current one
  const env = explorerToApiEnv(environmentName)
  return COW_SDK.cowApi.getOrders({ owner, offset, limit }, { chainId: networkId, env })
}

/**
 * Gets a order list within Tx
 */
export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId, txHash } = params

  console.log(`[getTxOrders] Fetching tx orders on network ${networkId}`)

  // sdk not merging array responses yet
  const orders = await Promise.all([
    COW_SDK.cowApi.getTxOrders(txHash, { chainId: networkId, env: 'prod' }),
    COW_SDK.cowApi.getTxOrders(txHash, { chainId: networkId, env: 'staging' }),
  ])

  return [...orders[0], ...orders[1]]
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
export async function getTrades(params: GetTradesParams & WithNetworkId): Promise<RawTrade[]> {
  const { networkId, owner, orderId } = params
  console.log(`[getTrades] Fetching trades on network ${networkId} with filters`, { owner, orderId })

  // sdk not merging array responses yet
  const trades = await Promise.all([
    // @ts-expect-error to avoid duplication we just pass both parameters
    COW_SDK.cowApi.getTrades({ owner, orderId }, { chainId: networkId, env: 'prod' }),
    // @ts-expect-error to avoid duplication we just pass both parameters
    COW_SDK.cowApi.getTrades({ owner, orderId }, { chainId: networkId, env: 'staging' }),
  ])

  return [...trades[0], ...trades[1]]
}

function _fetchQuery<T>(networkId: Network, queryString: string): Promise<T>
function _fetchQuery<T>(networkId: Network, queryString: string, nullOn404: true): Promise<T | null>
function _fetchQuery<T>(networkId: Network, queryString: string, nullOn404?: boolean): Promise<T | null> {
  const get = (): Promise<Response> => _get(networkId, queryString)
  if (nullOn404) {
    return fetchQuery({ get }, queryString, nullOn404)
  }

  return fetchQuery({ get }, queryString)
}
