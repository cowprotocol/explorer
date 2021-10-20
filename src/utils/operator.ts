// Util functions that only pertain to/deal with operator API related stuff
import BigNumber from 'bignumber.js'

import { calculatePrice, invertPrice, TokenErc20 } from '@gnosis.pm/dex-js'

import { FILLED_ORDER_EPSILON, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { Order, OrderStatus, RawOrder, RawTrade, Trade } from 'api/operator/types'

import { defaultAmountFormatPrecision, formatSmartMaxPrecision } from './format'

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
  if (isOrderFilled(order)) {
    return false
  }
  if (order.kind === 'buy') {
    return order.executedBuyAmount !== '0'
  } else {
    return order.executedSellAmount !== '0'
  }
}

export function getOrderStatus(order: RawOrder): OrderStatus {
  if (isOrderFilled(order)) {
    return 'filled'
  } else if (order.invalidated) {
    return 'canceled'
  } else if (isOrderExpired(order)) {
    return 'expired'
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

type Surplus = {
  amount: BigNumber
  percentage: BigNumber
}

type BigNumberIsh = string | BigNumber

/**
 * Calculates SELL surplus based on buy amounts
 *
 * @param buyAmount buyAmount
 * @param executedBuyAmount executedBuyAmount
 * @returns Sell surplus
 */
export function getSellSurplus(buyAmount: BigNumberIsh, executedBuyAmount: BigNumberIsh): Surplus {
  const buyAmountBigNumber = new BigNumber(buyAmount)
  const executedAmountBigNumber = new BigNumber(executedBuyAmount)
  // SELL order has the sell amount fixed, so it'll buy AT LEAST `buyAmount`
  // Surplus is in the form of additional buy amount
  // The difference between `executedBuyAmount - buyAmount` is the surplus.
  const amount = executedAmountBigNumber.gt(buyAmountBigNumber)
    ? executedAmountBigNumber.minus(buyAmountBigNumber)
    : ZERO_BIG_NUMBER
  const percentage = amount.dividedBy(buyAmountBigNumber)

  return { amount, percentage }
}

/**
 * Calculates BUY surplus based on sell amounts
 *
 * @param sellAmount sellAmount
 * @param executedSellAmountMinusFees executedSellAmount minus executedFeeAmount
 * @returns Buy surplus
 */
export function getBuySurplus(sellAmount: BigNumberIsh, executedSellAmountMinusFees: BigNumberIsh): Surplus {
  const sellAmountBigNumber = new BigNumber(sellAmount)
  const executedAmountBigNumber = new BigNumber(executedSellAmountMinusFees)
  // BUY order has the buy amount fixed, so it'll sell AT MOST `sellAmount`
  // Surplus will come in the form of a "discount", selling less than `sellAmount`
  // The difference between `sellAmount - executedSellAmount` is the surplus.
  const amount =
    executedAmountBigNumber.gt(ZERO_BIG_NUMBER) && sellAmountBigNumber.gt(executedAmountBigNumber)
      ? sellAmountBigNumber.minus(executedAmountBigNumber)
      : ZERO_BIG_NUMBER
  const percentage = amount.dividedBy(sellAmountBigNumber)

  return { amount, percentage }
}

export function getOrderSurplus(order: RawOrder): Surplus {
  const { kind, buyAmount, sellAmount, partiallyFillable } = order

  // `executedSellAmount` already has `executedFeeAmount` discounted
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  if (partiallyFillable) {
    // TODO: calculate how much was matched based on the type and check whether there was any surplus
    return { amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER }
  }

  if (kind === 'buy') {
    return getBuySurplus(sellAmount, executedSellAmount)
  } else {
    return getSellSurplus(buyAmount, executedBuyAmount)
  }
}

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` is derived from 2 fields (at time or writing)
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(
  order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmount' | 'executedFeeAmount'>,
): {
  executedBuyAmount: BigNumber
  executedSellAmount: BigNumber
} {
  return {
    executedBuyAmount: new BigNumber(order.executedBuyAmount),
    executedSellAmount: new BigNumber(order.executedSellAmount).minus(order.executedFeeAmount),
  }
}

interface CommonPriceParams {
  buyTokenDecimals: number
  sellTokenDecimals: number
  inverted?: boolean
}

export type GetRawOrderPriceParams = CommonPriceParams & {
  order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmount' | 'executedFeeAmount'>
}

export type GetOrderLimitPriceParams = CommonPriceParams & {
  buyAmount: string | BigNumber
  sellAmount: string | BigNumber
}

/**
 * Calculates order limit price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param buyAmount The order buyAmount
 * @param sellAmount The order sellAmount
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderLimitPrice({
  buyAmount,
  sellAmount,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetOrderLimitPriceParams): BigNumber {
  const price = calculatePrice({
    numerator: { amount: sellAmount, decimals: sellTokenDecimals },
    denominator: { amount: buyAmount, decimals: buyTokenDecimals },
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
}: GetRawOrderPriceParams): BigNumber {
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  // Only calculate the price when both values are set
  // Having only one value > 0 is anyway an invalid state
  if (executedBuyAmount.isZero() || executedSellAmount.isZero()) {
    return ZERO_BIG_NUMBER
  }

  return getOrderLimitPrice({
    buyAmount: executedBuyAmount,
    sellAmount: executedSellAmount,
    buyTokenDecimals,
    sellTokenDecimals,
    inverted,
  })
}

export function getShortOrderId(orderId: string, length = 8): string {
  return orderId.replace(/^0x/, '').slice(0, length)
}

function isZeroAddress(address: string): boolean {
  return /^0x0{40}$/.test(address)
}

export function isTokenErc20(token: TokenErc20 | null | undefined): token is TokenErc20 {
  return (token as TokenErc20)?.address !== undefined
}

export enum FormatAmountPrecision {
  defaultPrecision,
  highPrecision,
}

export function formattedAmount(
  erc20: TokenErc20 | null | undefined,
  amount: BigNumber,
  typePrecision: FormatAmountPrecision = FormatAmountPrecision.defaultPrecision,
): string {
  if (!isTokenErc20(erc20)) return '-'

  if (!erc20.decimals) return amount.toString(10)

  return typePrecision === FormatAmountPrecision.highPrecision
    ? formatSmartMaxPrecision(amount, erc20)
    : defaultAmountFormatPrecision(amount, erc20)
}

function getReceiverAddress({ owner, receiver }: RawOrder): string {
  return !receiver || isZeroAddress(receiver) ? owner : receiver
}

/**
 * Transforms a RawOrder into an Order object
 *
 * @param rawOrder RawOrder object
 */
export function transformOrder(rawOrder: RawOrder): Order {
  const {
    creationDate,
    validTo,
    buyToken,
    sellToken,
    buyAmount,
    sellAmount,
    feeAmount,
    executedFeeAmount,
    invalidated,
    ...rest
  } = rawOrder
  const receiver = getReceiverAddress(rawOrder)
  const shortId = getShortOrderId(rawOrder.uid)
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(rawOrder)
  const status = getOrderStatus(rawOrder)
  const partiallyFilled = isOrderPartiallyFilled(rawOrder)
  const fullyFilled = isOrderFilled(rawOrder)
  const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(rawOrder)
  const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(rawOrder)

  // TODO: fill in tx hash for fill or kill orders when available from the api
  const txHash = '0x489d8fd1efd43394c7c2b26216f36f1ab49b8d67623047e0fcb60efa2a2c420b'

  return {
    ...rest,
    receiver,
    txHash,
    shortId,
    creationDate: new Date(creationDate),
    expirationDate: new Date(validTo * 1000),
    buyTokenAddress: buyToken,
    sellTokenAddress: sellToken,
    buyAmount: new BigNumber(buyAmount),
    sellAmount: new BigNumber(sellAmount),
    executedBuyAmount,
    executedSellAmount,
    feeAmount: new BigNumber(feeAmount),
    executedFeeAmount: new BigNumber(executedFeeAmount),
    cancelled: invalidated,
    status,
    partiallyFilled,
    fullyFilled,
    filledAmount,
    filledPercentage,
    surplusAmount,
    surplusPercentage,
  }
}

/**
 * Transforms a RawTrade into a Trade object
 */
export function transformTrade(rawTrade: RawTrade): Trade {
  const { orderUid, buyAmount, sellAmount, sellAmountBeforeFees, buyToken, sellToken, executionTime, ...rest } =
    rawTrade

  return {
    ...rest,
    orderId: orderUid,
    buyAmount: new BigNumber(buyAmount),
    sellAmount: new BigNumber(sellAmount),
    sellAmountBeforeFees: new BigNumber(sellAmountBeforeFees),
    buyTokenAddress: buyToken,
    sellTokenAddress: sellToken,
    executionTime: new Date(executionTime),
  }
}
