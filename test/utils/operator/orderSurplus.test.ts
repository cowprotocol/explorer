import BigNumber from 'bignumber.js'

import { ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { RawOrder } from 'api/operator'

import { getOrderSurplus, getSurplus } from 'utils'

import { RAW_ORDER } from '../../data'

const ZERO_DOT_ZERO_ONE = new BigNumber('0.01')

describe('getSurplus', () => {
  const inputAmount = ONE_HUNDRED_BIG_NUMBER

  test('executedAmount = 0', () => {
    const executedAmount = ZERO_BIG_NUMBER
    expect(getSurplus(inputAmount, executedAmount)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
  })

  test('surplus 1%', () => {
    const executedAmount = ONE_BIG_NUMBER.plus(ONE_HUNDRED_BIG_NUMBER)
    expect(getSurplus(inputAmount, executedAmount)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
  })
})

describe('getOrderSurplus', () => {
  test('Buy order', () => {
    const order: RawOrder = { ...RAW_ORDER, kind: 'buy', sellAmount: '100', executedSellAmount: '101' }
    expect(getOrderSurplus(order)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
  })

  test('Sell order', () => {
    const order: RawOrder = { ...RAW_ORDER, kind: 'sell', buyAmount: '100', executedBuyAmount: '101' }
    expect(getOrderSurplus(order)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
  })
})
