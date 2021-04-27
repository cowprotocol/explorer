import { Network } from 'types'

import { buildSearchString } from 'utils/url'
import { isProd, isStaging } from 'utils/env'

import { OrderCreation } from './signatures'
import {
  FeeInformation,
  GetOrderParams,
  GetOrdersParams,
  GetTradesParams,
  OrderID,
  OrderPostError,
  RawOrder,
  RawTrade,
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

export function getOrderLink(networkId: Network, orderId: OrderID): string {
  const baseUrl = _getApiBaseUrl(networkId)

  return baseUrl + `/orders/${orderId}`
}

function _post(networkId: Network, url: string, data: unknown): Promise<Response> {
  const baseUrl = _getApiBaseUrl(networkId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function _get(networkId: Network, url: string): Promise<Response> {
  const baseUrl = _getApiBaseUrl(networkId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
  })
}

async function _getErrorForBadPostOrderRequest(response: Response): Promise<string> {
  let errorMessage: string
  try {
    const orderPostError: OrderPostError = await response.json()

    switch (orderPostError.errorType) {
      case 'DuplicateOrder':
        errorMessage = 'There was another identical order already submitted'
        break

      case 'InsufficientFunds':
        errorMessage = "The account doesn't have enough funds"
        break

      case 'InvalidSignature':
        errorMessage = 'The order signature is invalid'
        break

      case 'MissingOrderData':
        errorMessage = 'The order has missing information'
        break

      default:
        console.error('Unknown reason for bad order submission', orderPostError)
        errorMessage = orderPostError.description
        break
    }
  } catch (error) {
    console.error('Error handling a 400 error. Likely a problem deserialising the JSON response')
    errorMessage = 'The order was not accepted by the operator'
  }

  return errorMessage
}

async function _getErrorForUnsuccessfulPostOrder(response: Response): Promise<string> {
  let errorMessage: string
  switch (response.status) {
    case 400:
      errorMessage = await _getErrorForBadPostOrderRequest(response)
      break

    case 403:
      errorMessage = 'The order cannot be accepted. Your account is deny-listed.'
      break

    case 429:
      errorMessage = 'The order cannot be accepted. Too many order placements. Please, retry in a minute'
      break

    case 500:
    default:
      errorMessage = 'Error adding an order'
  }
  return errorMessage
}

export async function postSignedOrder(params: { networkId: Network; order: OrderCreation }): Promise<OrderID> {
  const { networkId, order } = params
  console.log('[utils:operator] Post signed order for network', networkId, order)

  // Call API
  const response = await _post(networkId, `/orders`, order)

  // Handle response
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await _getErrorForUnsuccessfulPostOrder(response)
    throw new Error(errorMessage)
  }

  const uid = (await response.json()) as string
  console.log('[api:operator] Success posting the signed order', uid)
  return uid
}

export async function getFeeQuote(networkId: Network, tokenAddress: string): Promise<FeeInformation> {
  // TODO: I commented out the implementation because the API is not yet implemented. Review the code in the comment below
  console.log('[api:operator] Get fee for ', networkId, tokenAddress)

  // TODO: Let see if we can incorporate the PRs from the Fee, where they cache stuff and keep it in sync using redux.
  // if that part is delayed or need more review, we can easily add the cache in this file (we check expiration and cache here)

  let response: Response | undefined
  try {
    const responseMaybeOk = await _get(networkId, `/tokens/${tokenAddress}/fee`)
    response = responseMaybeOk.ok ? responseMaybeOk : undefined
  } catch (error) {
    // do nothing
  }

  if (!response) {
    throw new Error('Error getting the fee')
  } else {
    return response.json()
  }
}

/**
 * Gets a single order by id
 */
export async function getOrder(params: GetOrderParams): Promise<RawOrder | null> {
  const { networkId, orderId } = params

  console.log(`[getOrder] Fetching order id '${orderId}' on network ${networkId}`)

  const queryString = `/orders/${orderId}`

  return _fetchQuery(networkId, queryString, true)
}

/**
 * Gets a list of orders
 *
 * Optional filters:
 *  - owner: address
 *  - sellToken: address
 *  - buyToken: address
 */
export async function getOrders(params: GetOrdersParams): Promise<RawOrder[]> {
  const { networkId, ...searchParams } = params
  const { owner, sellToken, buyToken } = searchParams

  console.log(
    `[getOrders] Fetching orders on network ${networkId} with filters: owner=${owner} sellToken=${sellToken} buyToken=${buyToken}`,
  )

  const searchString = buildSearchString({ ...searchParams })

  const queryString = '/orders/' + searchString

  return _fetchQuery(networkId, queryString)
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
  const { networkId, owner = '', orderId = '' } = params

  if (owner && orderId) {
    throw new Error('Cannot use both `owner` and `orderId` filters at the same time')
  }

  console.log(`[getTrades] Fetching trades on network ${networkId} with filters: owner=${owner} orderId=${orderId}`)

  const queryString = `/trades/` + buildSearchString({ owner, orderUid: orderId })

  return _fetchQuery(networkId, queryString)
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
