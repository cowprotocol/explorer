import BigNumber from 'bignumber.js'

import { Order, RawOrder } from 'api/operator'

import { ZERO_BIG_NUMBER } from 'const'

import { USDT, WETH } from './erc20s'

export const RAW_ORDER: RawOrder = {
  creationDate: '2021-01-20T23:15:07.892538607Z',
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  uid: '0xadef89adea9e8d7f987e98f79a87efde5f7e65df65e76d5f67e5d76f5edf',
  buyAmount: '0',
  executedBuyAmount: '0',
  sellAmount: '0',
  executedSellAmount: '0',
  feeAmount: '0',
  executedFeeAmount: '0',
  invalidated: false,
  sellToken: WETH.address,
  buyToken: USDT.address,
  validTo: 0,
  appData: 0,
  kind: 'sell',
  partiallyFillable: false,
  signature:
    '0x04dca25f59e9ac744c4093530a38f1719c4e0b1ce8e4b68c8018b6b05fd4a6944e1dcf2a009df2d5932f7c034b4a24da0999f9309dd5108d51d54236b605ed991c',
}

export const RICH_ORDER: Order = {
  ...RAW_ORDER,
  shortId: 'adef89ad',
  creationDate: new Date(RAW_ORDER.creationDate),
  expirationDate: new Date(RAW_ORDER.validTo * 1000),
  buyTokenAddress: RAW_ORDER.buyToken,
  sellTokenAddress: RAW_ORDER.sellToken,
  buyAmount: new BigNumber(RAW_ORDER.buyAmount),
  sellAmount: new BigNumber(RAW_ORDER.sellAmount),
  executedBuyAmount: ZERO_BIG_NUMBER,
  executedSellAmount: ZERO_BIG_NUMBER,
  feeAmount: new BigNumber(RAW_ORDER.feeAmount),
  executedFeeAmount: new BigNumber(RAW_ORDER.executedFeeAmount),
  cancelled: RAW_ORDER.invalidated,
  status: 'open',
  partiallyFilled: false,
  filledAmount: ZERO_BIG_NUMBER,
  filledPercentage: ZERO_BIG_NUMBER,
  buyToken: WETH,
  sellToken: USDT,
  surplusAmount: ZERO_BIG_NUMBER,
  surplusPercentage: ZERO_BIG_NUMBER,
}
