import { RawOrder } from 'api/operator'

import { FEE_TOKEN } from './basic'

export const ORDER: RawOrder = {
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
  sellToken: '0xa7d1c04faf998f9161fc9f800a99a809b84cfc9d',
  buyToken: FEE_TOKEN,
  validTo: 0,
  appData: 0,
  kind: 'sell',
  partiallyFillable: false,
  signature:
    '0x04dca25f59e9ac744c4093530a38f1719c4e0b1ce8e4b68c8018b6b05fd4a6944e1dcf2a009df2d5932f7c034b4a24da0999f9309dd5108d51d54236b605ed991c',
}
