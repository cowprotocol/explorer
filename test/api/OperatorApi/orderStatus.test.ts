import { RawOrder } from 'api/operator'
import { getOrderStatus } from 'api/operator/utils'

import { ORDER } from '../../data'
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
      const order: RawOrder = { ...ORDER, kind: 'buy', buyAmount: '10000', executedBuyAmount: '9999' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, exact amount', () => {
      const order: RawOrder = { ...ORDER, kind: 'buy', buyAmount: '100', executedBuyAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, not yet expired', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'buy',
        buyAmount: '100',
        executedBuyAmount: '100',
        validTo: _getCurrentTimestamp(),
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, sell amount does not affect output', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'buy',
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '100',
        executedSellAmount: '1100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
  describe('Sell order', () => {
    test('Filled, within epsilon', () => {
      const order: RawOrder = { ...ORDER, kind: 'sell', sellAmount: '10000', executedSellAmount: '9999' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, exact amount', () => {
      const order: RawOrder = { ...ORDER, kind: 'sell', sellAmount: '100', executedSellAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, not yet expired', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'sell',
        sellAmount: '100',
        executedSellAmount: '100',
        validTo: _getCurrentTimestamp(),
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, buy amount does not affect output', () => {
      const order: RawOrder = {
        ...ORDER,
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

describe('Partially filled status', () => {
  describe('Buy order', () => {
    test('Partially filled, on the border to be considered filled', () => {
      const order: RawOrder = { ...ORDER, kind: 'buy', buyAmount: '10000', executedBuyAmount: '9998' }

      expect(getOrderStatus(order)).toEqual('partially filled')
    })
    test('Partially filled', () => {
      const order: RawOrder = { ...ORDER, kind: 'buy', buyAmount: '10000', executedBuyAmount: '11' }

      expect(getOrderStatus(order)).toEqual('partially filled')
    })
    test('Partially filled, sell amount does not affect output', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '11',
        sellAmount: '10000',
        executedSellAmount: '123',
      }

      expect(getOrderStatus(order)).toEqual('partially filled')
    })
  })
  describe('Sell order', () => {
    test('Partially filled, on the border to be considered filled', () => {
      const order: RawOrder = { ...ORDER, kind: 'sell', sellAmount: '10000', executedSellAmount: '9998' }

      expect(getOrderStatus(order)).toEqual('partially filled')
    })
    test('Partially filled', () => {
      const order: RawOrder = { ...ORDER, kind: 'sell', sellAmount: '10000', executedSellAmount: '11' }

      expect(getOrderStatus(order)).toEqual('partially filled')
    })
    test('Partially filled, buy amount does not affect output', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '11',
        buyAmount: '10000',
        executedBuyAmount: '20',
      }

      expect(getOrderStatus(order)).toEqual('partially filled')
    })
  })
})

describe('Expired status', () => {
  describe('Buy order', () => {
    test('Expired', () => {
      const order: RawOrder = {
        ...ORDER,
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
        ...ORDER,
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
        ...ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, with partial fills', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'buy',
        buyAmount: '10000',
        executedBuyAmount: '10',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, sell amount does not affect output', () => {
      const order: RawOrder = {
        ...ORDER,
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
        ...ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, with partial fills', () => {
      const order: RawOrder = {
        ...ORDER,
        kind: 'sell',
        sellAmount: '10000',
        executedSellAmount: '10',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, buy amount does not affect output', () => {
      const order: RawOrder = {
        ...ORDER,
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
