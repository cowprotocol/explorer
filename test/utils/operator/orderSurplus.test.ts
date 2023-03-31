import BigNumber from 'bignumber.js'

import { ONE_BIG_NUMBER, TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { getOrderSurplus, ZERO_SURPLUS } from 'utils'

import { RAW_ORDER } from '../../data'
import { OrderKind } from '@cowprotocol/cow-sdk'

const ZERO_DOT_ZERO_ONE = new BigNumber('0.01')
const TEN_PERCENT = new BigNumber('0.1')
const TWENTY_PERCENT = new BigNumber('0.2')
const TWENTY_FIVE_PERCENT = new BigNumber('0.25')

describe('getOrderSurplus', () => {
  describe('Buy order', () => {
    describe('fillOrKill', () => {
      test('No surplus', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('No matches', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedSellAmountBeforeFees: '0',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('With fees = 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedBuyAmount: '100',
          executedSellAmountBeforeFees: '99',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
      })
      test('With fees > 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedBuyAmount: '100',
          executedSellAmountBeforeFees: '99',
          totalFee: '10',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
      })
    })
    describe('partiallyFillable', () => {
      // const order: RawOrder = {
      //   ...RAW_ORDER,
      //   partiallyFillable: true,
      //   kind: OrderKind.BUY,
      //   sellAmount: '100',
      //   executedSellAmountBeforeFees: '50',
      //   buyAmount: '100',
      //   executedBuyAmount: '40',
      // }
      // expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TWENTY_PERCENT })

      const ORDER = {
        ...RAW_ORDER,
        partiallyFillable: true,
        kind: OrderKind.BUY,
      }

      test('No matches', () => {
        const order = {
          ...ORDER,
          executedBuyAmount: '0',
          executedSellAmountBeforeFees: '0',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Partial match', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '50',
          sellAmount: '100',
          executedSellAmountBeforeFees: '40',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TWENTY_PERCENT })
      })
      test('Full match no surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '100',
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Full match with surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '100',
          sellAmount: '100',
          executedSellAmountBeforeFees: '90',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TEN_PERCENT })
      })
    })
  })

  describe('Sell order', () => {
    describe('fillOrKill', () => {
      test('No surplus', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('No matches', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '0',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('With fees = 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '101',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
      })
      test('With fees > 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '101',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ONE_BIG_NUMBER, percentage: ZERO_DOT_ZERO_ONE })
      })
    })
    describe('partiallyFillable', () => {
      const ORDER = {
        ...RAW_ORDER,
        partiallyFillable: true,
        kind: OrderKind.SELL,
        buyAmount: '100',
        executedBuyAmount: '50',
        sellAmount: '100',
        executedSellAmountBeforeFees: '40',
      }

      test('No matches', () => {
        const order = {
          ...ORDER,
          executedBuyAmount: '0',
          executedSellAmountBeforeFees: '0',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Partial match', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '50',
          sellAmount: '100',
          executedSellAmountBeforeFees: '40',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TWENTY_FIVE_PERCENT })
      })
      test('Full match no surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '100',
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Full match with surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '110',
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TEN_PERCENT })
      })
    })
  })
})
