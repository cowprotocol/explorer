// Util functions that only pertain to/deal with operator API related stuff

import BigNumber from 'bignumber.js'

import { FILLED_ORDER_EPSILON, ONE_BIG_NUMBER } from 'const'

import { RawOrder } from './types'

export type OrderStatus = 'open' | 'filled' | 'expired' | 'partially filled'

function isOrderFilled(order: RawOrder): boolean {
  let amount, executedAmount

  if (order.kind === 'buy') {
    amount = new BigNumber(order.buyAmount)
    executedAmount = new BigNumber(order.executedBuyAmount)
  } else {
    amount = new BigNumber(order.sellAmount)
    executedAmount = new BigNumber(order.executedSellAmount)
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
