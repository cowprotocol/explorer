import { RawOrder } from 'api/operator'
import { getOrderStatus } from 'api/operator/utils'

const BASE_ORDER: RawOrder = {
  creationDate: '2021-01-20T23:15:07.892538607Z',
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  uid: 'asdasdasd',
  buyAmount: '0',
  executedBuyAmount: '0',
  sellAmount: '0',
  executedSellAmount: '0',
  feeAmount: '0',
  executedFeeAmount: '0',
  invalidated: false,
  sellToken: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  buyToken: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  validTo: 0,
  appData: 0,
  kind: 'sell',
  partiallyFillable: false,
  signature:
    '0x04dca25f59e9ac744c4093530a38f1719c4e0b1ce8e4b68c8018b6b05fd4a6944e1dcf2a009df2d5932f7c034b4a24da0999f9309dd5108d51d54236b605ed991c',
}

describe('Filled status', () => {
  describe('Buy order', () => {
    test('Not filled', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'buy', buyAmount: '10000', executedBuyAmount: '9998' }

      expect(getOrderStatus(order)).not.toEqual('filled')
    })
    test('Filled, within epsilon', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'buy', buyAmount: '10000', executedBuyAmount: '9999' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, exact amount', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'buy', buyAmount: '100', executedBuyAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, surplus', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'buy', buyAmount: '1000', executedBuyAmount: '1001' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
  describe('Sell order', () => {
    test('Not filled', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'sell', sellAmount: '10000', executedSellAmount: '9998' }

      expect(getOrderStatus(order)).not.toEqual('filled')
    })
    test('Filled, within epsilon', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'sell', sellAmount: '10000', executedSellAmount: '9999' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, exact amount', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'sell', sellAmount: '100', executedSellAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, surplus', () => {
      const order: RawOrder = { ...BASE_ORDER, kind: 'sell', sellAmount: '1000', executedSellAmount: '1001' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
})
