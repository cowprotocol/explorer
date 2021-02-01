import { GetOrderParams, GetOrdersParams, RawOrder } from './types'

import { ORDER } from '../../../test/data'

export async function getOrder(params: GetOrderParams): Promise<RawOrder> {
  const { orderId } = params

  return {
    ...ORDER,
    uid: orderId,
  }
}

export async function getOrders(params: GetOrdersParams): Promise<RawOrder[]> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return [order]
}
