import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { TEN, ZERO } from '@gnosis.pm/dex-js'

const toChecksumAddress = Web3.utils.toChecksumAddress

import { Network, TokenDetails, Unpromise } from 'types'
import { AssertionError } from 'assert'
import { AuctionElement, Trade, Order } from 'api/exchange/ExchangeApi'
import { batchIdToDate } from './time'
import { ORDER_FILLED_FACTOR, MINIMUM_ALLOWANCE_DECIMALS, DEFAULT_TIMEOUT, NATIVE_TOKEN_ADDRESS } from 'const'

export function assertNonNull<T>(val: T, message: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError({ message })
  }
}

// eslint-disable-next-line
function noop(..._args: any[]): void {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logInfo = process.env.NODE_ENV === 'test' ? noop : (...args: any[]): void => console.log(...args)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let debugEnabled = process.env.NODE_ENV === 'development'

declare global {
  interface Window {
    toggleDebug: () => void
  }
}

window.toggleDebug = (): boolean => {
  debugEnabled = !debugEnabled
  return debugEnabled
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logDebug = (...args: any[]): void => {
  if (debugEnabled) {
    console.log(...args)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = process.env.NODE_ENV === 'development' ? noop : (...args: any[]): void => console.log(...args)

export function getToken<T extends TokenDetails, K extends keyof T>(
  key: K,
  value: string | number | undefined = '',
  tokens: T[] | undefined | null,
): T | undefined {
  if (!tokens) {
    return undefined
  }

  const token = tokens.find((token: T): boolean => {
    const tokenKeyValue = token[key]
    if (tokenKeyValue) {
      switch (typeof tokenKeyValue) {
        case 'string':
          return tokenKeyValue.toUpperCase() === (value as string).toUpperCase()
        case 'number':
          return tokenKeyValue === value
        default:
          return false
      }
    } else {
      return false
    }
  })

  return token
}

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms, result))

/**
 * Uses images from https://github.com/trustwallet/tokens
 */
export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined
  try {
    const checksummedAddress = toChecksumAddress(tokenAddress)
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`
  } catch (e) {
    return undefined
  }
}

export function isNativeToken(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
}

export function getImageAddress(address: string, network: Network): string {
  if (isNativeToken(address)) {
    // What is going on here?
    // Well, this address here is the path on `src/assets/tokens/`
    // So these special values will use the local images,
    // because they are native tokens and don't really have an address
    return network === Network.GNOSIS_CHAIN ? 'xdai' : 'eth'
  }
  return address
}

export function isTokenEnabled(allowance: BN, { decimals = 18 }: TokenDetails): boolean {
  const allowanceValue = TEN.pow(new BN(decimals + MINIMUM_ALLOWANCE_DECIMALS))
  return allowance.gte(allowanceValue)
}

function isAmountDifferenceGreaterThanNegligibleAmount(amount1: BN, amount2: BN): boolean {
  // consider an oder filled when less than `negligibleAmount` is left
  const negligibleAmount = amount1.divRound(ORDER_FILLED_FACTOR)
  return !amount2.gte(negligibleAmount)
}

/**
 * When orders are `deleted` from the contract, they are still returned, but with all fields set to zero.
 * We will not display such orders.
 *
 * This function checks whether the order has been zeroed out.
 * @param order The order object to check
 */
export function isOrderDeleted(order: Order): boolean {
  return (
    order.buyTokenId === 0 &&
    order.sellTokenId === 0 &&
    order.priceDenominator.eq(ZERO) &&
    order.priceNumerator.eq(ZERO) &&
    order.validFrom === 0 &&
    order.validUntil === 0
  )
}

export function isOrderFilled(order: AuctionElement): boolean {
  return isAmountDifferenceGreaterThanNegligibleAmount(order.priceDenominator, order.remainingAmount)
}

export function isTradeFilled(trade: Trade): boolean {
  return (
    !!trade.remainingAmount && isAmountDifferenceGreaterThanNegligibleAmount(trade.sellAmount, trade.remainingAmount)
  )
}

export function isTradeSettled(trade: Trade): boolean {
  return trade.settlingTimestamp <= Date.now()
}

export function isTradeReverted(trade: Trade): boolean {
  return !!trade.revertId
}

export const isOrderActive = (order: AuctionElement, now: Date): boolean =>
  batchIdToDate(order.validUntil) >= now && !isOrderFilled(order)

export const isPendingOrderActive = (order: AuctionElement, now: Date): boolean =>
  batchIdToDate(order.validUntil) >= now || order.validUntil === 0

export async function silentPromise<T>(promise: Promise<T>, customMessage?: string): Promise<T | undefined> {
  try {
    return await promise
  } catch (e) {
    logDebug(customMessage || 'Failed to fetch promise', e.message)
    return
  }
}

export function setStorageItem(key: string, data: unknown): void {
  // localStorage API accepts only strings
  const formattedData = JSON.stringify(data)
  return localStorage.setItem(key, formattedData)
}

interface RetryOptions {
  retriesLeft?: number
  interval?: number
  exponentialBackOff?: boolean
}

/**
 * Retry function with delay.
 *
 * Inspired by: https://gitlab.com/snippets/1775781
 *
 * @param fn Parameterless function to retry
 * @param retriesLeft How many retries. Defaults to 3
 * @param interval How long to wait between retries. Defaults to 1s
 * @param exponentialBackOff Whether to use exponential back off, doubling wait interval. Defaults to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function retry<T extends () => any>(fn: T, options?: RetryOptions): Promise<Unpromise<ReturnType<T>>> {
  const { retriesLeft = 3, interval = 1000, exponentialBackOff = true } = options || {}

  try {
    return await fn()
  } catch (error) {
    if (retriesLeft) {
      await delay(interval)

      return retry(fn, {
        retriesLeft: retriesLeft - 1,
        interval: exponentialBackOff ? interval * 2 : interval,
        exponentialBackOff,
      })
    } else {
      throw new Error(`Max retries reached`)
    }
  }
}

export function flattenMapOfLists<K, T>(map: Map<K, T[]>): T[] {
  return Array.from(map.values()).reduce<T[]>((acc, list) => acc.concat(list), [])
}

export function flattenMapOfSets<K, T>(map: Map<K, Set<T>>): T[] {
  return Array.from(map.values()).reduce<T[]>((acc, set) => acc.concat(Array.from(set)), [])
}

export function divideBN(numerator: BN, denominator: BN): BigNumber {
  return new BigNumber(numerator.toString()).dividedBy(denominator.toString())
}

export const RequireContextMock: __WebpackModuleApi.RequireContext = Object.assign(() => '', {
  keys: () => [],
  resolve: () => '',
  id: '',
})

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export const isNonZeroNumber = (value?: string | number): boolean => !!value && !!+value

export interface TimeoutParams<T> {
  time?: number
  result?: T
  timeoutErrorMsg?: string
}

export function timeout(params: TimeoutParams<undefined>): Promise<never> // never means function throws
export function timeout<T>(params: TimeoutParams<T extends undefined ? never : T>): Promise<T>
export async function timeout<T>(params: TimeoutParams<T>): Promise<T | never> {
  const { time = DEFAULT_TIMEOUT, result, timeoutErrorMsg: timeoutMsg = 'Timeout' } = params

  await delay(time)
  // provided defined result -- return it
  if (result !== undefined) return result
  // no defined result -- throw message
  throw new Error(timeoutMsg)
}

/**
 * Check if a string is an orderId against regex
 *
 * @param text Possible OrderId string to check
 */
export const isAnOrderId = (text: string): boolean => text.match(/^0x[a-fA-F0-9]{112}$/)?.input !== undefined

/**
 * Check if string is an address account against regex
 *
 * @param text Possible address string to check
 */
export const isAnAddressAccount = (text: string): boolean => {
  if (isEns(text)) {
    return true
  } else {
    return text.match(/^0x[a-fA-F0-9]{40}$/)?.input !== undefined
  }
}

/**
 * Check if string is a valid ENS address against regex
 *
 * @param text Possible ENS address string to check
 * @returns true if valid or false if not
 */
export const isEns = (text: string): boolean => text.match(/[a-zA-Z0-9]+\.[a-zA-Z]+$/)?.input !== undefined

/**
 * Check if a string is a valid Tx Hash against regex
 *
 * @param text Possible TxHash string to check
 * @returns true if valid or false if not
 */
export const isATxHash = (text: string): boolean => text.match(/^(0x)?([a-fA-F0-9]{64})$/)?.input !== undefined

/** Convert string to lowercase and remove whitespace */
export function cleanNetworkName(networkName: string | undefined): string {
  if (!networkName) return ''

  return networkName.replace(/\s+/g, '').toLowerCase()
}
/**
 * Returns the difference in percentage between two numbers
 *
 * @export
 * @param {number} a
 * @param {number} b
 * @return {*}  {number}
 */
export function getPercentageDifference(a: number, b: number): number {
  return b ? ((a - b) / b) * 100 : 0
}
