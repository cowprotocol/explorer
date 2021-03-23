import { RawOrder } from 'api/operator'

import { getOrderStatus } from 'utils'

import { RAW_ORDER } from '../../data'
import { mockTimes, DATE } from '../../testHelpers'

function _getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

function _getPastTimestamp(): number {
  return Math.floor(DATE.getTime() / 1000) - 1
}

// mockTimes set's Date.now() to DATE const in the test context
beforeEach(mockTimes)

describe('Filled status', () => {
  describe('Buy order', () => {
    test('Filled, within epsilon', () => {
      const order: RawOrder = { ...RAW_ORDER, kind: 'buy', buyAmount: '10000', executedBuyAmount: '9999' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, exact amount', () => {
      const order: RawOrder = { ...RAW_ORDER, kind: 'buy', buyAmount: '100', executedBuyAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, not yet expired', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '100',
        executedBuyAmount: '100',
        validTo: _getCurrentTimestamp(),
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, sell amount does not affect output', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '100',
        executedSellAmount: '1100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, fee does not affect output', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '1000',
        executedSellAmount: '1100',
        executedFeeAmount: '100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
  describe('Sell order', () => {
    test('Filled, within epsilon', () => {
      const order: RawOrder = { ...RAW_ORDER, kind: 'sell', sellAmount: '10000', executedSellAmount: '9999' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, exact amount', () => {
      const order: RawOrder = { ...RAW_ORDER, kind: 'sell', sellAmount: '100', executedSellAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, not yet expired', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '100',
        executedSellAmount: '100',
        validTo: _getCurrentTimestamp(),
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, with fee', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '90',
        executedSellAmount: '100',
        executedFeeAmount: '10',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, buy amount does not affect output', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '100',
        executedSellAmount: '100',
        buyAmount: '100',
        executedBuyAmount: '1100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
})

describe('Canceled status', () => {
  test('Buy order', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: 'buy',
      buyAmount: '10000',
      invalidated: true,
    }
    expect(getOrderStatus(order)).toEqual('canceled')
  })
  test('Sell order', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: 'sell',
      sellAmount: '10000',
      invalidated: true,
    }
    expect(getOrderStatus(order)).toEqual('canceled')
  })
  test('Expired and invalidated', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: 'sell',
      sellAmount: '10000',
      invalidated: true,
      validTo: _getPastTimestamp(),
    }
    expect(getOrderStatus(order)).toEqual('canceled')
  })
})

describe('Expired status', () => {
  describe('Buy order', () => {
    test('Expired', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getPastTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('expired')
    })
  })
  describe('Sell order', () => {
    test('Expired', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '0',
        validTo: _getPastTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('expired')
    })
  })
})

describe('Open status', () => {
  describe('Buy order', () => {
    test('Open, no fills', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, with partial fills', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '10',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, sell amount does not affect output', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '10',
        sellAmount: '10000',
        executedSellAmount: '123',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
  })
  describe('Sell order', () => {
    test('Open, no fills', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, with partial fills', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '10',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, buy amount does not affect output', () => {
      const order: RawOrder = {
        ...RAW_ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '10',
        buyAmount: '10000',
        executedBuyAmount: '323',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
  })
})
