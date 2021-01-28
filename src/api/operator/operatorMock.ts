import { GetOrderParams, GetOrdersParams, RawOrder } from './types'

export async function getOrder(params: GetOrderParams): Promise<RawOrder> {
  const { orderId } = params

  return {
    creationDate: '2021-01-20T23:15:07.892538607Z',
    owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
    uid: orderId,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedFeeAmount: '0',
    invalidated: false,
    sellToken: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    buyToken: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
    sellAmount: '7427114767544192805',
    buyAmount: '123430917449497756077616602295',
    validTo: 1611185680,
    appData: 0,
    feeAmount: '0',
    kind: 'sell',
    partiallyFillable: false,
    signature:
      '0x04dca25f59e9ac744c4093530a38f1719c4e0b1ce8e4b68c8018b6b05fd4a6944e1dcf2a009df2d5932f7c034b4a24da0999f9309dd5108d51d54236b605ed991c',
  }
}

export async function getOrders(params: GetOrdersParams): Promise<RawOrder[]> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return [order]
}
