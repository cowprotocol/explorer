// Util functions that only pertain to/deal with operator API related stuff
import BigNumber from 'bignumber.js'

import { calculatePrice, invertPrice } from '@gnosis.pm/dex-js'

import { FILLED_ORDER_EPSILON, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { OrderStatus, RawOrder } from './types'

function isOrderFilled(order: RawOrder): boolean {
  let amount, executedAmount

  if (order.kind === 'buy') {
    amount = new BigNumber(order.buyAmount)
    executedAmount = new BigNumber(order.executedBuyAmount)
  } else {
    amount = new BigNumber(order.sellAmount)
    executedAmount = new BigNumber(order.executedSellAmount).minus(order.executedFeeAmount)
  }

  const minimumAmount = amount.multipliedBy(ONE_BIG_NUMBER.minus(FILLED_ORDER_EPSILON))

  return executedAmount.gte(minimumAmount)
}

function isOrderExpired(order: RawOrder): boolean {
  return Math.floor(Date.now() / 1000) > order.validTo
}

function isOrderPartiallyFilled(order: RawOrder): boolean {
  if (order.kind === 'buy') {
    return order.executedBuyAmount !== '0'
  } else {
    return order.executedSellAmount !== '0'
  }
}

export function getOrderStatus(order: RawOrder): OrderStatus {
  if (isOrderFilled(order)) {
    return 'filled'
  } else if (isOrderExpired(order)) {
    if (isOrderPartiallyFilled(order)) {
      return 'partially filled'
    } else {
      return 'expired'
    }
  } else {
    return 'open'
  }
}

/**
 * Get order filled amount, both as raw amount (in atoms) and as percentage (from 0 to 1)
 *
 * @param order The order
 */
export function getOrderFilledAmount(order: RawOrder): { amount: BigNumber; percentage: BigNumber } {
  let executedAmount, totalAmount

  if (order.kind === 'buy') {
    executedAmount = new BigNumber(order.executedBuyAmount)
    totalAmount = new BigNumber(order.buyAmount)
  } else {
    executedAmount = new BigNumber(order.executedSellAmount).minus(order.executedFeeAmount)
    totalAmount = new BigNumber(order.sellAmount)
  }

  return { amount: executedAmount, percentage: executedAmount.div(totalAmount) }
}

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` is derived from 2 fields (at time or writing)
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(
  order: RawOrder,
): { executedBuyAmount: BigNumber; executedSellAmount: BigNumber } {
  return {
    executedBuyAmount: new BigNumber(order.executedBuyAmount),
    executedSellAmount: new BigNumber(order.executedSellAmount).minus(order.executedFeeAmount),
  }
}

export type GetOrderPriceParams = {
  order: RawOrder
  buyTokenDecimals: number
  sellTokenDecimals: number
  inverted?: boolean
}

/**
 * Calculates order limit price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param order The order
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderLimitPrice({
  order,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetOrderPriceParams): BigNumber {
  const price = calculatePrice({
    numerator: { amount: order.buyAmount, decimals: buyTokenDecimals },
    denominator: { amount: order.sellAmount, decimals: sellTokenDecimals },
  })

  return inverted ? invertPrice(price) : price
}

/**
 * Calculates order executed price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param order The order
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderExecutedPrice({
  order,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetOrderPriceParams): BigNumber {
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  // Only calculate the price when both values are set
  // Having only one value > 0 is anyway an invalid state
  if (executedBuyAmount.isZero() || executedSellAmount.isZero()) {
    return ZERO_BIG_NUMBER
  }

  const price = calculatePrice({
    numerator: { amount: executedBuyAmount, decimals: buyTokenDecimals },
    denominator: { amount: executedSellAmount, decimals: sellTokenDecimals },
  })

  return inverted ? invertPrice(price) : price
}
