import BigNumber from 'bignumber.js'

import { ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER, TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { RawOrder } from 'api/operator'

import { getOrderExecutedPrice, getOrderLimitPrice, GetRawOrderPriceParams, GetOrderLimitPriceParams } from 'utils'

import { RAW_ORDER } from '../../data'

const ZERO_DOT_ONE = new BigNumber('0.1')

function _assertOrderPrice(
  order: RawOrder,
  getPriceFn: (params: GetRawOrderPriceParams | GetOrderLimitPriceParams) => BigNumber,
): void {
  const params =
    getPriceFn.name == 'getOrderLimitPrice' ? { buyAmount: order.buyAmount, sellAmount: order.sellAmount } : { order }

  test('Buy token decimals == sell token decimals', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 2, sellTokenDecimals: 2 })).toEqual(TEN_BIG_NUMBER)
  })
  test('Buy token decimals < sell token decimals', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 1, sellTokenDecimals: 2 })).toEqual(ONE_BIG_NUMBER)
  })
  test('Buy token decimals > sell token decimals', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 2, sellTokenDecimals: 1 })).toEqual(ONE_HUNDRED_BIG_NUMBER)
  })
  test('Inverted price', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 2, sellTokenDecimals: 2, inverted: true })).toEqual(ZERO_DOT_ONE)
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
    const order: RawOrder = { ...RAW_ORDER, kind: 'buy', buyAmount: '100', sellAmount: '1000' }

    _assertOrderPrice(order, getOrderLimitPrice)
  })

  describe('Sell order', () => {
    const order: RawOrder = { ...RAW_ORDER, kind: 'sell', buyAmount: '100', sellAmount: '1000' }

    _assertOrderPrice(order, getOrderLimitPrice)
  })
})

describe('Executed price', () => {
  describe('Buy order', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: 'buy',
      executedBuyAmount: '100',
      executedSellAmount: '1010',
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
      ...RAW_ORDER,
      kind: 'sell',
      executedBuyAmount: '100',
      executedSellAmount: '1010',
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
