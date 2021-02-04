import BigNumber from 'bignumber.js'

import { ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER, TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { RawOrder } from 'api/operator'
import { getOrderExecutedPrice, getOrderLimitPrice, GetOrderPriceParams } from 'api/operator/utils'

import { ORDER } from '../../data'

const ZERO_DOT_ONE = new BigNumber('0.1')

function _assertOrderPrice(order: RawOrder, getPriceFn: (params: GetOrderPriceParams) => BigNumber): void {
  test('Buy token decimals == sell token decimals', () => {
    expect(getPriceFn({ order, buyTokenDecimals: 2, sellTokenDecimals: 2 })).toEqual(TEN_BIG_NUMBER)
  })
  test('Buy token decimals > sell token decimals', () => {
    expect(getPriceFn({ order, buyTokenDecimals: 2, sellTokenDecimals: 1 })).toEqual(ONE_BIG_NUMBER)
  })
  test('Buy token decimals < sell token decimals', () => {
    expect(getPriceFn({ order, buyTokenDecimals: 1, sellTokenDecimals: 2 })).toEqual(ONE_HUNDRED_BIG_NUMBER)
  })
  test('Inverted price', () => {
    expect(getPriceFn({ order, buyTokenDecimals: 2, sellTokenDecimals: 2, inverted: true })).toEqual(ZERO_DOT_ONE)
  })
}

function _assertOrderPriceWithoutFills(_order: RawOrder): void {
  const order = {
    ..._order,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedFeeAmount: '0',
  }
  test('Regular', () => {
    expect(getOrderExecutedPrice({ order, buyTokenDecimals: 2, sellTokenDecimals: 2 })).toEqual(ZERO_BIG_NUMBER)
  })
  test('Inverted price', () => {
    expect(getOrderExecutedPrice({ order, buyTokenDecimals: 2, sellTokenDecimals: 2, inverted: true })).toEqual(
      ZERO_BIG_NUMBER,
    )
  })
}

describe('Limit price', () => {
  describe('Buy order', () => {
    const order: RawOrder = { ...ORDER, kind: 'buy', buyAmount: '1000', sellAmount: '100' }

    _assertOrderPrice(order, getOrderLimitPrice)
  })

  describe('Sell order', () => {
    const order: RawOrder = { ...ORDER, kind: 'sell', buyAmount: '1000', sellAmount: '100' }

    _assertOrderPrice(order, getOrderLimitPrice)
  })
})

describe('Executed price', () => {
  describe('Buy order', () => {
    const order: RawOrder = {
      ...ORDER,
      kind: 'buy',
      executedBuyAmount: '1000',
      executedSellAmount: '110',
      executedFeeAmount: '10',
    }

    describe('With fills', () => {
      _assertOrderPrice(order, getOrderExecutedPrice)
    })
    describe('Without fills', () => {
      _assertOrderPriceWithoutFills(order)
    })
  })

  describe('Sell order', () => {
    const order: RawOrder = {
      ...ORDER,
      kind: 'sell',
      executedBuyAmount: '1000',
      executedSellAmount: '110',
      executedFeeAmount: '10',
    }

    describe('With fills', () => {
      _assertOrderPrice(order, getOrderExecutedPrice)
    })
    describe('Without fills', () => {
      _assertOrderPriceWithoutFills(order)
    })
  })
})
